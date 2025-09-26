import db from '@db'
import type { EntityName } from '@type'
import { entityNames, evolutionTypes, parentEntities } from '@lib/constant'
import {
  dateToTimestamp,
  timestampToDate,
  convertQuarterToFullDate,
} from '@lib/time'
import { diffWords } from 'diff'
import { getPeriod } from '@lib/time'
import { splitOnLastSeparator } from '@lib/util'

const arrowRight = `<i class="fas fa-arrow-right"></i>`

function getEvoDeleted() {
  const evoDeleted = {}
  db.foreach('evolution', evo => {
    if (evo.type === 'delete') {
      if (!(evo.entity in evoDeleted)) {
        evoDeleted[evo.entity] = {}
      }
      evoDeleted[evo.entity][evo.entity_id] = evo
    }
  })
  return evoDeleted
}

function getItem(entity, entityId, evoDeleted) {
  if (db.tableHasId(entity, entityId)) {
    const item = db.get(entity, entityId)
    item._deleted = false
    item.parent_entity_id = item[`${parentEntities[entity]}_id`]
    return item
  }
  const item = evoDeleted[entity]?.[entityId]
  if (item) {
    item._deleted = true
    return item
  }
  return null
}

function addHistory(evoDeleted) {
  db.foreach('evolution', evo => {
    const item = getItem(evo.entity, evo.entity_id, evoDeleted)
    if (item && item.name) {
      evo.name = item.name
      evo.parent_entity_id = item.parent_entity_id
      evo._deleted = item._deleted
      evo.id = item.id
    } else if (evo.entity === 'value') {
      const [id, value] = splitOnLastSeparator(evo.entity_id, '---')
      evo._deleted = true
      evo.parent_entity_id = id
      evo.name = value ? value : evo.entity_id
    } else {
      evo.name = evo.entity_id
      evo._deleted = true
      evo._toHide = true
    }

    const parentEntity =
      parentEntities[evo.entity] === 'parent'
        ? evo.entity
        : parentEntities[evo.entity]

    evo._entity = evo.entity
    evo._entityClean = entityNames[evo.entity]
    evo.typeClean = evolutionTypes[evo.type]
    evo.parentEntity = parentEntity
    evo.parentEntityClean = entityNames[parentEntity]
    evo.timestamp *= 1000
    evo.time = evo.timestamp > Date.now() ? 'Futur' : 'Passé'

    const parentItem = getItem(
      evo.parentEntity,
      evo.parent_entity_id,
      evoDeleted,
    )
    evo.parentName = parentItem?.name
    evo.parentDeleted = parentItem?._deleted
    evo.isFavorite = false

    evo.date = timestampToDate(evo.timestamp)
    evo.folder_id = getFolderId(evo.entity, item, parentItem)
  })

  db.tables.evolution = db.tables.evolution?.filter(evo => !evo._toHide)
}

function getFolderId(entity, entityData, parentItem) {
  if (entity === 'folder') {
    return entityData?.id
  } else if (entity === 'dataset') {
    return entityData?.folder_id
  } else if (entity === 'variable') {
    return parentItem?.folder_id
  } else if (entity === 'modality') {
    return entityData?.folder_id
  } else if (entity === 'value') {
    return parentItem?.folder_id
  }
  return null
}

function addValidity(validities, type, entity, entityData, evoDeleted) {
  const parentEntity =
    parentEntities[entity] === 'parent' ? entity : parentEntities[entity]
  const parentItem = getItem(
    parentEntity,
    entityData[`${parentEntities[entity]}_id`],
    evoDeleted,
  )

  const timestamp = dateToTimestamp(
    entityData[type],
    type === 'start_date' ? 'start' : 'end',
  )

  if (!timestamp) {
    console.error(
      `Invalid date format for ${type} in ${entity} with id ${entityData.id}, value = ${entityData[type]}`,
    )
    return
  }

  const time = timestamp > Date.now() ? 'Futur' : 'Passé'

  let typeClean = 'Autre'
  if (type in evolutionTypes) typeClean = evolutionTypes[type]

  const folderId = getFolderId(entity, entityData, parentItem)

  validities.push({
    id: entityData.id,
    entity: entity,
    _entity: entity,
    _entityClean: entityNames[entity],
    entity_id: entityData.id,
    parentEntity: parentEntity,
    parentEntityClean: entityNames[parentEntity],
    parent_entity_id: entityData[`${parentEntities[entity]}_id`],
    parentName: parentItem?.name,
    name: entityData.name,
    type,
    old_value: entityData[type],
    new_value: entityData[type],
    variable: type,
    typeClean: typeClean,
    timestamp,
    time,
    date: timestampToDate(timestamp),
    folder_id: folderId,
    isFavorite: false,
  })
}

function addValidities(evoDeleted) {
  const validities = []
  const entities = Object.keys(parentEntities) as EntityName[]
  for (const entity of entities) {
    const tableData = db.tables[entity]
    if (
      Array.isArray(tableData) &&
      tableData.length > 0 &&
      (Object.keys(tableData[0]).includes('start_date') ||
        Object.keys(tableData[0]).includes('end_date') ||
        Object.keys(tableData[0]).includes('last_update_date') ||
        Object.keys(tableData[0]).includes('nextUpdateDate'))
    ) {
      db.foreach(entity, entityData => {
        if ('start_date' in entityData && entityData.start_date) {
          addValidity(validities, 'start_date', entity, entityData, evoDeleted)
        }
        if ('end_date' in entityData && entityData.end_date) {
          addValidity(validities, 'end_date', entity, entityData, evoDeleted)
        }
        if ('last_update_date' in entityData && entityData.last_update_date) {
          addValidity(
            validities,
            'last_update_date',
            entity,
            entityData,
            evoDeleted,
          )
        }
        if ('nextUpdateDate' in entityData && entityData.nextUpdateDate) {
          addValidity(
            validities,
            'nextUpdateDate',
            entity,
            entityData,
            evoDeleted,
          )
        }
      })
    }
  }

  if (!db.tables.evolution) db.tables.evolution = []
  for (const validity of validities) {
    db.tables.evolution.push(validity)
  }
}

export function evolutionInitialSetup() {
  const evoDeleted = getEvoDeleted()
  addHistory(evoDeleted)
  addValidities(evoDeleted)
}

function parseDateStandard(dateString) {
  if (dateString.length === 6 && dateString[4] === 't') {
    dateString = convertQuarterToFullDate(dateString, 'start')
  }
  const parts = dateString.split('/')
  if (parts.length === 2) parts.push(1)
  if (parts.length !== 3) return null
  const [year, month, day] = parts.map(Number)
  if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return new Date(year, month - 1, day)
  }
  return null
}

function outputDiffNumber(oldVal, newVal) {
  const diff = newVal - oldVal
  const percentageChange =
    oldVal !== 0 ? ((diff / oldVal) * 100).toFixed(1) : '∞'
  const diffClass = diff > 0 ? 'highlight_diff_add' : 'highlight_diff_delete'

  return `${oldVal.toLocaleString()} ${arrowRight} ${newVal.toLocaleString()} 
      <br><span class="${diffClass}">${
        diff > 0 ? '+' : ''
      }${diff.toLocaleString()} | 
      ${diff > 0 ? '+' : ''}${percentageChange}%</span>
  `
}

function outputDiffDate(oldDate, newDate, oldDateString, newDateString) {
  const diffDays = Math.ceil((newDate - oldDate) / (1000 * 60 * 60 * 24))
  const diffClass =
    diffDays > 0 ? 'highlight_diff_add' : 'highlight_diff_delete'

  const diffRelative = getPeriod(oldDate, newDate, true)

  return `
  ${oldDateString} ${arrowRight} ${newDateString}
  <br><span class="${diffClass}">${
    diffDays > 0 ? '+' : ''
  }${diffRelative}</span>`
}

function outputDiffString(oldVal, newVal) {
  const diff = diffWords(oldVal, newVal)
  return diff
    .map(part => {
      if (part.added) {
        return `<span class="highlight_diff_add">${part.value}</span>`
      } else if (part.removed) {
        return `<span class="highlight_diff_delete">${part.value}</span>`
      } else {
        return `<span>${part.value}</span>`
      }
    })
    .join('')
}

export function highlightDiff(a, b, variable = null) {
  if (!a && !b) return ''

  if (variable === 'last_update') {
    a = timestampToDate(a * 1000)
    b = timestampToDate(b * 1000)
  }

  a = a ? a.toString() : ''
  b = b ? b.toString() : ''

  let oldDate = null
  let newDate = null
  const isANumber = !isNaN(a) && a !== ''
  const isBNumber = !isNaN(b) && b !== ''

  if (!isANumber) {
    oldDate = parseDateStandard(a)
  } else {
    a = parseFloat(a)
    if (a > 1800 && a < 2100) {
      oldDate = new Date(a, 0, 1)
    }
  }

  if (!isBNumber) {
    newDate = parseDateStandard(b)
  } else {
    b = parseFloat(b)
    if (b > 1800 && b < 2100) {
      newDate = new Date(b, 0, 1)
    }
  }

  if (oldDate && newDate) return outputDiffDate(oldDate, newDate, a, b)
  if (isANumber && isBNumber) return outputDiffNumber(a, b)
  if (isANumber) a = a.toString()
  if (isBNumber) b = b.toString()
  return outputDiffString(a, b)
}
