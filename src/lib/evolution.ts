import db from '@db'
import type { EntityName } from '@type'
import { entity_names, evolution_types, parent_entities } from '@lib/constant'
import {
  dateToTimestamp,
  timestampToDate,
  convertQuarterToFullDate,
} from '@lib/time'
import { diffWords } from 'diff'
import { getPeriod } from '@lib/time'
import { splitOnLastSeparator } from '@lib/util'

const arrow_right = `<i class="fas fa-arrow-right"></i>`

function getEvoDeleted() {
  const evo_deleted = {}
  db.foreach('evolution', evo => {
    if (evo.type === 'delete') {
      if (!(evo.entity in evo_deleted)) {
        evo_deleted[evo.entity] = {}
      }
      evo_deleted[evo.entity][evo.entity_id] = evo
    }
  })
  return evo_deleted
}

function getItem(entity, entity_id, evo_deleted) {
  if (db.tableHasId(entity, entity_id)) {
    const item = db.get(entity, entity_id)
    item._deleted = false
    item.parent_entity_id = item[`${parent_entities[entity]}_id`]
    return item
  }
  const item = evo_deleted[entity]?.[entity_id]
  if (item) {
    item._deleted = true
    return item
  }
  return null
}

function addHistory(evo_deleted) {
  db.foreach('evolution', evo => {
    const item = getItem(evo.entity, evo.entity_id, evo_deleted)
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
      evo._to_hide = true
    }

    const parent_entity =
      parent_entities[evo.entity] === 'parent'
        ? evo.entity
        : parent_entities[evo.entity]

    evo._entity = evo.entity
    evo._entity_clean = entity_names[evo.entity]
    evo.type_clean = evolution_types[evo.type]
    evo.parent_entity = parent_entity
    evo.parent_entity_clean = entity_names[parent_entity]
    evo.timestamp *= 1000
    evo.time = evo.timestamp > Date.now() ? 'Futur' : 'Passé'

    const parent_item = getItem(
      evo.parent_entity,
      evo.parent_entity_id,
      evo_deleted,
    )
    evo.parent_name = parent_item?.name
    evo.parent_deleted = parent_item?._deleted
    evo.is_favorite = false

    evo.date = timestampToDate(evo.timestamp)
    evo.folder_id = getFolderId(evo.entity, item, parent_item)
  })

  db.tables.evolution = db.tables.evolution?.filter(evo => !evo._to_hide)
}

function getFolderId(entity, entity_data, parent_item) {
  if (entity === 'folder') {
    return entity_data?.id
  } else if (entity === 'dataset') {
    return entity_data?.folder_id
  } else if (entity === 'variable') {
    return parent_item?.folder_id
  } else if (entity === 'modality') {
    return entity_data?.folder_id
  } else if (entity === 'value') {
    return parent_item?.folder_id
  }
  return null
}

function addValidity(validities, type, entity, entity_data, evo_deleted) {
  const parent_entity =
    parent_entities[entity] === 'parent' ? entity : parent_entities[entity]
  const parent_item = getItem(
    parent_entity,
    entity_data[`${parent_entities[entity]}_id`],
    evo_deleted,
  )

  const timestamp = dateToTimestamp(
    entity_data[type],
    type === 'start_date' ? 'start' : 'end',
  )

  if (!timestamp) {
    console.error(
      `Invalid date format for ${type} in ${entity} with id ${entity_data.id}, value = ${entity_data[type]}`,
    )
    return
  }

  const time = timestamp > Date.now() ? 'Futur' : 'Passé'

  let type_clean = 'Autre'
  if (type in evolution_types) type_clean = evolution_types[type]

  const folder_id = getFolderId(entity, entity_data, parent_item)

  validities.push({
    id: entity_data.id,
    entity: entity,
    _entity: entity,
    _entity_clean: entity_names[entity],
    entity_id: entity_data.id,
    parent_entity: parent_entity,
    parent_entity_clean: entity_names[parent_entity],
    parent_entity_id: entity_data[`${parent_entities[entity]}_id`],
    parent_name: parent_item?.name,
    name: entity_data.name,
    type,
    old_value: entity_data[type],
    new_value: entity_data[type],
    variable: type,
    type_clean,
    timestamp,
    time,
    date: timestampToDate(timestamp),
    folder_id,
    is_favorite: false,
  })
}

function addValidities(evo_deleted) {
  const validities = []
  const entities = Object.keys(parent_entities) as EntityName[]
  for (const entity of entities) {
    const tableData = db.tables[entity]
    if (
      Array.isArray(tableData) &&
      tableData.length > 0 &&
      (Object.keys(tableData[0]).includes('start_date') ||
        Object.keys(tableData[0]).includes('end_date') ||
        Object.keys(tableData[0]).includes('last_update_date') ||
        Object.keys(tableData[0]).includes('next_update_date'))
    ) {
      db.foreach(entity, entity_data => {
        if ('start_date' in entity_data && entity_data.start_date) {
          addValidity(
            validities,
            'start_date',
            entity,
            entity_data,
            evo_deleted,
          )
        }
        if ('end_date' in entity_data && entity_data.end_date) {
          addValidity(validities, 'end_date', entity, entity_data, evo_deleted)
        }
        if ('last_update_date' in entity_data && entity_data.last_update_date) {
          addValidity(
            validities,
            'last_update_date',
            entity,
            entity_data,
            evo_deleted,
          )
        }
        if ('next_update_date' in entity_data && entity_data.next_update_date) {
          addValidity(
            validities,
            'next_update_date',
            entity,
            entity_data,
            evo_deleted,
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
  const evo_deleted = getEvoDeleted()
  addHistory(evo_deleted)
  addValidities(evo_deleted)
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

  return `${oldVal.toLocaleString()} ${arrow_right} ${newVal.toLocaleString()} 
      <br><span class="${diffClass}">${
        diff > 0 ? '+' : ''
      }${diff.toLocaleString()} | 
      ${diff > 0 ? '+' : ''}${percentageChange}%</span>
  `
}

function outputDiffDate(oldDate, newDate, old_date_string, new_date_string) {
  const diffDays = Math.ceil((newDate - oldDate) / (1000 * 60 * 60 * 24))
  const diffClass =
    diffDays > 0 ? 'highlight_diff_add' : 'highlight_diff_delete'

  const diff_relative = getPeriod(oldDate, newDate, true)

  return `
  ${old_date_string} ${arrow_right} ${new_date_string}
  <br><span class="${diffClass}">${
    diffDays > 0 ? '+' : ''
  }${diff_relative}</span>`
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
  const is_a_number = !isNaN(a) && a !== ''
  const is_b_number = !isNaN(b) && b !== ''

  if (!is_a_number) {
    oldDate = parseDateStandard(a)
  } else {
    a = parseFloat(a)
    if (a > 1800 && a < 2100) {
      oldDate = new Date(a, 0, 1)
    }
  }

  if (!is_b_number) {
    newDate = parseDateStandard(b)
  } else {
    b = parseFloat(b)
    if (b > 1800 && b < 2100) {
      newDate = new Date(b, 0, 1)
    }
  }

  if (oldDate && newDate) return outputDiffDate(oldDate, newDate, a, b)
  if (is_a_number && is_b_number) return outputDiffNumber(a, b)
  if (is_a_number) a = a.toString()
  if (is_b_number) b = b.toString()
  return outputDiffString(a, b)
}
