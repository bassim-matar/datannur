import db from '@db'
import { getVariableTypeClean, capitalize } from '@lib/util'
import { getPeriod, dateToTimestamp, timestampToDate } from '@lib/time'
import { getNbValues } from '@lib/render'
import { entityNames } from '@lib/constant'
import { evolutionInitialSetup } from '@lib/evolution'

function addTags(entity, item) {
  item.tags = db.getAll('tag', { [entity]: item.id })
}
function addParents(entity, item) {
  item.parents = db.getParents(entity, item.id)
}
function addFavorite(item) {
  item.isFavorite = false
}
function addNb(entity, item, entityNb) {
  item[`nb${capitalize(entityNb)}`] = db.countRelated(entity, item.id, entityNb)
}
function addNbRecursive(entity, item, target) {
  item[`nb${capitalize(target)}Recursive`] = getRecursive(
    entity,
    item.id,
    target,
  ).length
}
function addInstitutionNb(institution, entity) {
  institution[`nb${capitalize(entity)}`] = getInstitutionItems(
    institution.id,
    entity,
  ).length
}
function addNbChild(entity, item) {
  item.nbChild = db.countRelated('parent', item.id, entity)
}
function addNbChildRecursive(entity, item) {
  const childs = db.getAllChilds(entity, item.id)
  item.nbChildRecursive = childs.length
}
function addName(item, entity, alias = '') {
  if (!alias) alias = entity
  const itemId = item[`${alias}Id`]
  let itemName = ''
  if (itemId !== null && itemId !== undefined)
    itemName = db.get(entity, itemId)?.name as string
  item[`${alias}Name`] = itemName || ''
}
function addVariableNum(dataset, entity, variableEntity) {
  const variables = db.getAll(variableEntity, { [entity]: dataset.id })
  for (const [i, variable] of variables.entries()) variable.num = i + 1
}
function addEntities(item) {
  item.entities = []
  for (const entity of ['institution', 'folder', 'dataset']) {
    if (item['nb' + capitalize(entity)] > 0) {
      item.entities.push({ name: entity, nb: item['nb' + capitalize(entity)] })
    }
  }
}
function addPeriod(item) {
  item.period = ''
  if (item.startDate && item.startDate === item.endDate)
    item.period = item.startDate
  else if (item.startDate && item.endDate) {
    item.periodDuration = getPeriod(item.startDate, item.endDate, true)
    item.period = `${item.startDate} - ${item.endDate}`
  } else if (item.startDate) item.period = `dès ${item.startDate}`
  else if (item.endDate) item.period = `jusqu'à ${item.endDate}`
}

function addDocs(entity, item) {
  item.docs = db.getAll('doc', { [entity]: item.id })
  for (const doc of item.docs) {
    doc.entity = entity
    doc.entityId = item.id
  }
}

function variableAddDatasetInfo(variable) {
  const dataset = db.get('dataset', variable.datasetId)
  if (!dataset) return
  variable.nbRow = dataset.nbRow
  variable.datasetName = dataset.name
  variable.datasetType = dataset.type
  variable.folderName = ''
  if (db.use.folder) {
    variable.folderId = dataset.folderId
    variable.folderName = dataset.folderName
  }
  if (db.use.owner) {
    variable.ownerId = dataset.ownerId
    variable.ownerName = dataset.ownerName
  }
  if (db.use.manager) {
    variable.managerId = dataset.managerId
    variable.managerName = dataset.managerName
  }
}

function addEntity(item, entity) {
  item._entity = entity
  item._entityClean = entityNames[entity]
}

function addSourceVar(variable) {
  if (!variable.sourceVarIds) return false
  variable.sourceIds = []
  const dataset = db.get('dataset', variable.datasetId)
  for (const sourceVarIdRaw of variable.sourceVarIds.split(',')) {
    const sourceVarId = sourceVarIdRaw.trim()
    const sourceVar = db.get('variable', sourceVarId.trim())
    if (!sourceVar) continue
    variable.sourceIds.push(sourceVarId)
    if (!sourceVar.derivedIds) sourceVar.derivedIds = []
    sourceVar.derivedIds.push(variable.id)

    if (dataset) {
      if (!dataset.sourceIds) dataset.sourceIds = new Set()
      if (dataset.id !== sourceVar.datasetId) {
        dataset.sourceIds.add(sourceVar.datasetId)
      }
    }
    const sourceDataset = db.get('dataset', sourceVar.datasetId)
    if (sourceDataset) {
      if (!sourceDataset.derivedIds) sourceDataset.derivedIds = new Set()
      if (sourceDataset.id !== dataset.id) {
        sourceDataset.derivedIds.add(dataset.id)
      }
    }
  }
}

function addNextUpdate(item) {
  if (!item.lastUpdateDate || !item.updatingEach || item.noMoreUpdate) return
  let diff
  const updatingEach = item.updatingEach.toLowerCase()
  if (updatingEach === 'quotidienne') diff = 24 * 3600
  else if (updatingEach === 'hebdomadaire') diff = 7 * (24 * 3600)
  else if (updatingEach === 'mensuelle') diff = 30 * (24 * 3600)
  else if (updatingEach === 'trimestrielle') diff = 90 * (24 * 3600)
  else if (updatingEach === 'semestrielle') diff = 180 * (24 * 3600)
  else if (updatingEach === 'annuelle') diff = 365 * (24 * 3600)
  else if (updatingEach === 'biennale') diff = 2 * (365 * 24 * 3600)
  else if (updatingEach === 'triennale') diff = 3 * (365 * 24 * 3600)
  else if (updatingEach === 'quadrimestrielle') diff = 4 * (365 * 24 * 3600)
  else if (updatingEach === 'quinquennale') diff = 5 * (365 * 24 * 3600)

  if (diff) {
    const lastUpdate = dateToTimestamp(item.lastUpdateDate)
    item.nextUpdateDate = timestampToDate(lastUpdate + diff * 1000)
  }
}

export function makeParentsRelative(parentId, items) {
  for (const item of items) {
    let position = 0
    item.parentsRelative = []
    if (!item.parents) continue
    for (const [i, parent] of item.parents.entries()) {
      if (parent.id === parentId) position = i + 1
    }
    item.parentsRelative = item.parents.slice(position)
  }
}

function getInstitutionItems(institutionId, entity) {
  const ownItems = db.getAll(entity, { owner: institutionId })
  const manageItems = db.getAll(entity, { manager: institutionId })
  return removeDuplicateById([...ownItems, ...manageItems])
}

export function getRecursive(entity, itemId, target) {
  const get =
    entity === 'institution'
      ? id => getInstitutionItems(id, target)
      : id => db.getAll(target, { [entity]: id })
  let items = get(itemId)
  const childs = db.getAllChilds(entity, itemId)
  for (const child of childs) items = items.concat(get(child.id))
  return removeDuplicateById(items)
}

export function getSortByName(a, b) {
  return a?.name?.localeCompare(b?.name)
}

export function getParentPath(row) {
  const items = 'parentsRelative' in row ? row.parentsRelative : row.parents
  const parents = items.map(parent => parent.name)
  parents.push(row.name)
  return parents.join(' / ')
}

export function removeDuplicateById(items) {
  return items.filter((v, i, a) => a.findIndex(v2 => v2.id === v.id) === i)
}

export function filterKeys(list, keys) {
  return list.map(o => Object.fromEntries(keys.map(k => [k, o[k]])))
}

export function addMinimumDeep(items, noDeep = false, noIndent = false) {
  let minimumDeep = 999
  for (const item of items) {
    if (item.parentsRelative.length < minimumDeep) {
      minimumDeep = item.parentsRelative.length
    }
  }
  for (const item of items) {
    if (noDeep) item.minimumDeep = item.parentsRelative.length
    else item.minimumDeep = minimumDeep

    item.noIndent = noIndent
    if (noIndent) item.minimumDeep = 0
  }
}

export function getLineage(entity, elem, lineageType) {
  const lineage = []
  const lineageIds = elem[`${lineageType}Ids`]
  if (!lineageIds) return lineage
  for (const id of lineageIds) {
    const item = db.get(entity, id)
    if (!item) continue
    lineage.push({ ...item, lineageType })
  }
  return lineage
}

class Process {
  static institution() {
    db.foreach('institution', institution => {
      addEntity(institution, 'institution')
      addFavorite(institution)
      addPeriod(institution)
      addTags('institution', institution)
      addParents('institution', institution)
      addDocs('institution', institution)
      addNbChild('institution', institution)
      addNbChildRecursive('institution', institution)
      addInstitutionNb(institution, 'folder')
      addInstitutionNb(institution, 'dataset')
      addNbRecursive('institution', institution, 'folder')
      const datasets = getRecursive('institution', institution.id, 'dataset')
      const variables = datasets.flatMap(dataset =>
        db.getAll('variable', { dataset }),
      )
      institution.nbDatasetRecursive = datasets.length
      institution.nbVariableRecursive = variables.length
    })
  }
  static folder() {
    db.foreach('folder', folder => {
      addEntity(folder, 'folder')
      addFavorite(folder)
      addTags('folder', folder)
      addParents('folder', folder)
      addDocs('folder', folder)
      addNbChild('folder', folder)
      addNbChildRecursive('folder', folder)
      addNextUpdate(folder)
      if (db.use.owner) addName(folder, 'institution', 'owner')
      if (db.use.manager) addName(folder, 'institution', 'manager')
      addPeriod(folder)
      const datasets = getRecursive('folder', folder.id, 'dataset')
      const variables = datasets.flatMap(dataset =>
        db.getAll('variable', { dataset }),
      )
      folder.nbDatasetRecursive = datasets.length
      folder.nbVariableRecursive = variables.length
    })
  }
  static tag() {
    db.foreach('tag', tag => {
      addEntity(tag, 'tag')
      addFavorite(tag)
      addNb('tag', tag, 'institution')
      addNb('tag', tag, 'folder')
      addNb('tag', tag, 'dataset')
      addNb('tag', tag, 'variable')
      addDocs('tag', tag)
      addEntities(tag)
      if (db.useRecursive.tag) addParents('tag', tag)
      addNbChild('tag', tag)
      addNbChildRecursive('tag', tag)
      addNbRecursive('tag', tag, 'institution')
      addNbRecursive('tag', tag, 'folder')
      addNbRecursive('tag', tag, 'doc')
      addNbRecursive('tag', tag, 'dataset')
      addNbRecursive('tag', tag, 'variable')
    })
  }
  static dataset() {
    const filters = getLocalFilter()
    const filterToName = {}
    for (const filter of filters) {
      db.use.filter = true
      filterToName[filter.id] = filter.name
    }
    db.foreach('dataset', dataset => {
      addEntity(dataset, 'dataset')
      addFavorite(dataset)
      addTags('dataset', dataset)
      addDocs('dataset', dataset)
      if (db.use.owner) addName(dataset, 'institution', 'owner')
      if (db.use.manager) addName(dataset, 'institution', 'manager')
      if (db.use.folder) {
        addName(dataset, 'folder')
      } else dataset.folderName = ''
      addVariableNum(dataset, 'dataset', 'variable')
      addNb('dataset', dataset, 'variable')
      addPeriod(dataset)
      addNextUpdate(dataset)
      dataset.typeClean = ''
      if (dataset.type) {
        dataset.typeClean = filterToName[dataset.type]
      }
    })
  }
  static doc() {
    db.foreach('doc', doc => {
      addEntity(doc, 'doc')
      addFavorite(doc)
      addNb('doc', doc, 'institution')
      addNb('doc', doc, 'folder')
      addNb('doc', doc, 'dataset')
      addNb('doc', doc, 'tag')
      addEntities(doc)
      if (doc.lastUpdate) doc.lastUpdate *= 1000
      doc.lastUpdateDate = ''
      if (doc.lastUpdate) {
        doc.lastUpdateDate = new Date(doc.lastUpdate)
          .toISOString()
          .slice(0, 10)
          .replaceAll('-', '/')
      }
    })
  }
  static variable() {
    db.foreach('variable', variable => {
      addEntity(variable, 'variable')
      addFavorite(variable)
      addPeriod(variable)
      addTags('variable', variable)
      variable.modalities = []
      variable.values = []
      const modalities = db.getAll('modality', { variable })
      for (const modality of modalities) {
        const values = db.getAll('value', { modality })
        variable.values = variable.values.concat(values)
        variable.modalities = variable.modalities.concat(modality)
      }
      variable.valuesPreview = [...variable.values.slice(0, 10)]
      variable.typeClean = getVariableTypeClean(variable.type)
      variableAddDatasetInfo(variable)
      const nbValues = getNbValues(variable.values, variable)
      variable.nbDistinct = nbValues
      variable.nbValue = nbValues
      addSourceVar(variable)
      if (variable.key) variable.key = 'oui'

      const freqData = db.getAll('freq', { variable })
      variable.hasFreq = freqData.length > 0

      if (freqData.length > 0) {
        const freqSorted = [...freqData].sort(
          (a, b) => (b.freq || 0) - (a.freq || 0),
        )
        const totalFreq = freqData.reduce(
          (sum, item) => sum + (item.freq || 0),
          0,
        )
        const maxFreq = freqSorted[0].freq || 1
        variable.freqPreview = freqSorted.slice(0, 10).map(item => ({
          ...item,
          total: totalFreq,
          max: maxFreq,
        }))
      } else {
        variable.freqPreview = []
      }

      if (!nbValues || !variable.nbDuplicate) return
      variable.nbDuplicate = Math.max(variable.nbRow - nbValues, 0)
      if (variable.nbMissing) variable.nbDuplicate -= variable.nbMissing
    })
  }
  static modality() {
    db.foreach('modality', modality => {
      addEntity(modality, 'modality')
      addFavorite(modality)
      addNb('modality', modality, 'variable')
      if (db.use.folder) addName(modality, 'folder')

      modality.variables = db.getAll('variable', { modality })
      modality.values = db.getAll('value', { modality })
      modality.nbValue = modality.values.length
      modality.valuesPreview = [...modality.values.slice(0, 10)]
      for (const value of modality.values) {
        value.modalityName = modality.name
        if (value.value === null) value.value = ''
        else {
          value.value = value.value.toString()
        }
      }
      if (!modality.type && modality.variables.length > 0) {
        modality.type = modality.variables[0].type
      }
      modality.typeClean = getVariableTypeClean(modality.type)
    })
  }
  static metaVariable() {
    db.foreach('metaVariable', metaVariable => {
      addEntity(metaVariable, 'metaVariable')
      metaVariable.isMeta = true
      metaVariable.typeClean = getVariableTypeClean(metaVariable.type)
      metaVariable.nbValue = getNbValues(metaVariable.values, metaVariable)
      if (metaVariable.name === 'id') metaVariable.key = 'oui'

      const metaDataset = db.get('metaDataset', metaVariable.metaDatasetId)
      metaVariable.datasetId = metaDataset.id
      metaVariable.datasetName = metaDataset.name
      metaVariable.nbRow = metaDataset.nbRow
      metaVariable.metaFolderId = metaDataset.metaFolderId
      metaVariable.folderName = metaDataset.metaFolderId as string
      metaVariable.metaLocalisation = ''
      if (metaVariable.isInMeta && !metaVariable.isInData)
        metaVariable.metaLocalisation = 'schéma'
      if (!metaVariable.isInMeta && metaVariable.isInData)
        metaVariable.metaLocalisation = 'données'
    })
  }
  static metaDataset() {
    db.foreach('metaDataset', metaDataset => {
      addEntity(metaDataset, 'metaDataset')
      metaDataset.isMeta = true
      metaDataset.folder = { id: metaDataset.metaFolderId }
      metaDataset.folderName = metaDataset.metaFolderId as string
      addVariableNum(metaDataset, 'metaDataset', 'metaVariable')
      const metaVariables = db.getAll('metaVariable', { metaDataset })
      metaDataset.nbVariable = metaVariables.length
      if (metaDataset.lastUpdateTimestamp)
        metaDataset.lastUpdateTimestamp *= 1000
      metaDataset.metaLocalisation = ''
      if (metaDataset.isInMeta && !metaDataset.isInData)
        metaDataset.metaLocalisation = 'schéma'
      if (!metaDataset.isInMeta && metaDataset.isInData)
        metaDataset.metaLocalisation = 'données'
    })
  }
  static metaFolder() {
    db.foreach('metaFolder', metaFolder => {
      addEntity(metaFolder, 'metaFolder')
      metaFolder.isMeta = true
      const metaDatasets = db.getAll('metaDataset', { metaFolder })
      metaFolder.nbDataset = metaDatasets.length
      metaFolder.nbVariable = 0
      for (const metaDataset of metaDatasets)
        metaFolder.nbVariable += metaDataset.nbVariable
    })
  }

  static evolution() {
    evolutionInitialSetup()
  }
}

function addDocRecursive() {
  for (const entity of ['institution', 'folder', 'dataset', 'tag'] as const) {
    db.foreach(entity, item => {
      item.docsRecursive = []
      let docs = []
      if (entity === 'institution') {
        const childs = getRecursive(entity, item.id, entity)
        for (const child of childs) docs = docs.concat(child.docs)
      }
      if (['institution', 'folder'].includes(entity)) {
        const folders = getRecursive(entity, item.id, 'folder')
        const datasets = getRecursive(entity, item.id, 'dataset')
        for (const folder of folders) docs = docs.concat(folder.docs)
        for (const dataset of datasets) docs = docs.concat(dataset.docs)
      }
      if (docs.length > 1) docs = removeDuplicateById(docs)
      for (const doc of docs) {
        item.docsRecursive.push({ ...doc, inherited: 'hérité' })
      }
      if (item.docs) item.docsRecursive = item.docsRecursive.concat(item.docs)
    })
  }
}

export function getLocalFilter() {
  const dbFilters = []
  for (const configRow of db.getAll('config')) {
    if (configRow.id?.startsWith('filter_')) {
      dbFilters.push({
        id: configRow.value?.split(':')[0]?.trim(),
        name: configRow.value?.split(':')[1]?.trim(),
      })
    }
  }
  if (dbFilters.length > 0) return dbFilters
  return db.getAll('filter')
}

export function dbAddProcessedData() {
  Process.institution()
  Process.folder()
  Process.tag()
  Process.dataset()
  Process.doc()
  Process.variable()
  Process.modality()
  Process.metaVariable()
  Process.metaDataset()
  Process.metaFolder()
  Process.evolution()
  if (db.use.doc) addDocRecursive()
}
