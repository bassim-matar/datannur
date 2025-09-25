import db from '@db'
import { getVariableTypeClean, escapeHtmlEntities } from '@lib/util'
import { getPeriod, dateToTimestamp, timestampToDate } from '@lib/time'
import { getNbValues } from '@lib/render'
import { entity_names } from '@lib/constant'
import { evolutionInitialSetup } from '@lib/evolution'

interface UserData {
  log?: unknown[]
  favorite?: unknown[]
  search_history?: unknown[]
  [key: string]: unknown
}

function addEntitiesUsed() {
  db.use = {}
  for (const entity of [
    'institution',
    'folder',
    'tag',
    'doc',
    'dataset',
    'variable',
    'modality',
    'filter',
  ]) {
    db.use[entity] = isDbUsing(entity)
  }
  if (db.use.institution) {
    db.use.owner = isDbUsing('owner')
    db.use.manager = isDbUsing('manager')
  }
  if (db.use.tag) {
    const tags = db.getAll('tag')
    if (tags.length > 0 && tags[0].parent_id !== undefined) {
      db.use.tag_recursive = true
    }
  }
}

function isDbUsing(entity) {
  return db.getAll(entity).length > 0
}
function addTags(entity, item) {
  item.tags = db.getAll('tag', { [entity]: item.id })
}
function addParents(entity, item) {
  item.parents = db.getParents(entity, item.id)
}
function addFavorite(item) {
  item.is_favorite = false
}
function addNb(entity, item, entity_nb) {
  item[`nb_${entity_nb}`] = db.hasNb(entity, item.id, entity_nb)
}
function addNbRecursive(entity, item, target) {
  item[`nb_${target}_recursive`] = getRecursive(entity, item.id, target).length
}
function addInstitutionNb(institution, entity) {
  institution[`nb_${entity}`] = getInstitutionItems(
    institution.id,
    entity,
  ).length
}
function addNbChild(entity, item) {
  item.nb_child = db.hasNb('parent', item.id, entity)
}
function addNbChildRecursive(entity, item) {
  const childs = db.getAllChilds(entity, item.id)
  item.nb_child_recursive = childs.length
}
function addName(item, entity, alias = '') {
  if (!alias) alias = entity
  const item_id = item[`${alias}_id`]
  let item_name = ''
  if (item_id !== null && item_id !== undefined)
    item_name = db.get(entity, item_id)?.name as string
  item[`${alias}_name`] = item_name || ''
}
function addVariableNum(dataset, entity, variable_entity) {
  const variables = db.getAll(variable_entity, { [entity]: dataset.id })
  for (const [i, variable] of variables.entries()) variable.num = i + 1
}
function addEntities(item) {
  item.entities = []
  for (const entity of ['institution', 'folder', 'dataset']) {
    if (item['nb_' + entity] > 0) {
      item.entities.push({ name: entity, nb: item['nb_' + entity] })
    }
  }
}
function addPeriod(item) {
  item.period = ''
  if (item.start_date && item.start_date === item.end_date)
    item.period = item.start_date
  else if (item.start_date && item.end_date) {
    item.period_duration = getPeriod(item.start_date, item.end_date, true)
    item.period = `${item.start_date} - ${item.end_date}`
  } else if (item.start_date) item.period = `dès ${item.start_date}`
  else if (item.end_date) item.period = `jusqu'à ${item.end_date}`
}

function addDocs(entity, item) {
  item.docs = db.getAll('doc', { [entity]: item.id })
  for (const doc of item.docs) {
    doc.entity = entity
    doc.entity_id = item.id
  }
}

function variableAddDatasetInfo(variable) {
  const dataset = db.get('dataset', variable.dataset_id)
  if (!dataset) return
  variable.nb_row = dataset.nb_row
  variable.dataset_name = dataset.name
  variable.dataset_type = dataset.type
  variable.folder_name = ''
  if (db.use.folder) {
    variable.folder_id = dataset.folder_id
    variable.folder_name = dataset.folder_name
  }
  if (db.use.owner) {
    variable.owner_id = dataset.owner_id
    variable.owner_name = dataset.owner_name
  }
  if (db.use.manager) {
    variable.manager_id = dataset.manager_id
    variable.manager_name = dataset.manager_name
  }
}

function addEntity(item, entity) {
  item._entity = entity
  item._entity_clean = entity_names[entity]
}

function addSourceVar(variable) {
  if (!variable.sourceVar_ids) return false
  variable.source_ids = []
  const dataset = db.get('dataset', variable.dataset_id)
  for (const sourceVar_id_raw of variable.sourceVar_ids.split(',')) {
    const sourceVar_id = sourceVar_id_raw.trim()
    const sourceVar = db.get('variable', sourceVar_id.trim())
    if (!sourceVar) continue
    variable.source_ids.push(sourceVar_id)
    if (!sourceVar.derived_ids) sourceVar.derived_ids = []
    sourceVar.derived_ids.push(variable.id)

    if (dataset) {
      if (!dataset.source_ids) dataset.source_ids = new Set()
      if (dataset.id !== sourceVar.dataset_id) {
        dataset.source_ids.add(sourceVar.dataset_id)
      }
    }
    const source_dataset = db.get('dataset', sourceVar.dataset_id)
    if (source_dataset) {
      if (!source_dataset.derived_ids) source_dataset.derived_ids = new Set()
      if (source_dataset.id !== dataset.id) {
        source_dataset.derived_ids.add(dataset.id)
      }
    }
  }
}

function addNextUpdate(item) {
  if (!item.last_update_date || !item.updating_each || item.no_more_update)
    return
  let diff
  const updating_each = item.updating_each.toLowerCase()
  if (updating_each === 'quotidienne') diff = 24 * 3600
  else if (updating_each === 'hebdomadaire') diff = 7 * (24 * 3600)
  else if (updating_each === 'mensuelle') diff = 30 * (24 * 3600)
  else if (updating_each === 'trimestrielle') diff = 90 * (24 * 3600)
  else if (updating_each === 'semestrielle') diff = 180 * (24 * 3600)
  else if (updating_each === 'annuelle') diff = 365 * (24 * 3600)
  else if (updating_each === 'biennale') diff = 2 * (365 * 24 * 3600)
  else if (updating_each === 'triennale') diff = 3 * (365 * 24 * 3600)
  else if (updating_each === 'quadrimestrielle') diff = 4 * (365 * 24 * 3600)
  else if (updating_each === 'quinquennale') diff = 5 * (365 * 24 * 3600)

  if (diff) {
    const last_update = dateToTimestamp(item.last_update_date)
    item.next_update_date = timestampToDate(last_update + diff * 1000)
  }
}

export function makeParentsRelative(parent_id, items) {
  for (const item of items) {
    let position = 0
    item.parents_relative = []
    if (!item.parents) continue
    for (const [i, parent] of item.parents.entries()) {
      if (parent.id === parent_id) position = i + 1
    }
    item.parents_relative = item.parents.slice(position)
  }
}

function getInstitutionItems(institution_id, entity) {
  const own_items = db.getAll(entity, { owner: institution_id })
  const manage_items = db.getAll(entity, { manager: institution_id })
  return removeDuplicateById([...own_items, ...manage_items])
}

export function getRecursive(entity, item_id, target) {
  const get =
    entity === 'institution'
      ? id => getInstitutionItems(id, target)
      : id => db.getAll(target, { [entity]: id })
  let items = get(item_id)
  const childs = db.getAllChilds(entity, item_id)
  for (const child of childs) items = items.concat(get(child.id))
  return removeDuplicateById(items)
}

export async function getUserData(): Promise<UserData> {
  return new Promise(resolve => {
    db.browser.getAll('user_data/', items =>
      resolve(items as unknown as UserData),
    )
  })
}

export function getSortByName(a, b) {
  return a?.name?.localeCompare(b?.name)
}

export function getParentPath(row) {
  const items = 'parents_relative' in row ? row.parents_relative : row.parents
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

export function addMinimumDeep(items, no_deep = false, no_indent = false) {
  let minimum_deep = 999
  for (const item of items) {
    if (item.parents_relative.length < minimum_deep) {
      minimum_deep = item.parents_relative.length
    }
  }
  for (const item of items) {
    if (no_deep) item.minimum_deep = item.parents_relative.length
    else item.minimum_deep = minimum_deep

    item.no_indent = no_indent
    if (no_indent) item.minimum_deep = 0
  }
}

export function getLineage(entity, elem, lineage_type) {
  const lineage = []
  const lineage_ids = elem[`${lineage_type}_ids`]
  if (!lineage_ids) return lineage
  for (const id of lineage_ids) {
    const item = db.get(entity, id)
    if (!item) continue
    lineage.push({ ...item, lineage_type })
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
      institution.nb_dataset_recursive = datasets.length
      institution.nb_variable_recursive = variables.length
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
      folder.nb_dataset_recursive = datasets.length
      folder.nb_variable_recursive = variables.length
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
      if (db.use.tag_recursive) addParents('tag', tag)
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
    const filter_to_name = {}
    for (const filter of filters) {
      db.use.filter = true
      filter_to_name[filter.id] = filter.name
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
      } else dataset.folder_name = ''
      addVariableNum(dataset, 'dataset', 'variable')
      addNb('dataset', dataset, 'variable')
      addPeriod(dataset)
      addNextUpdate(dataset)
      dataset.type_clean = ''
      if (dataset.type) {
        dataset.type_clean = filter_to_name[dataset.type]
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
      if (doc.last_update) doc.last_update *= 1000
      doc.last_update_date = ''
      if (doc.last_update) {
        doc.last_update_date = new Date(doc.last_update)
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
      variable.values_preview = [...variable.values.slice(0, 10)]
      variable.type_clean = getVariableTypeClean(variable.type)
      variableAddDatasetInfo(variable)
      const nb_values = getNbValues(variable.values, variable)
      variable.nb_distinct = nb_values
      variable.nb_value = nb_values
      addSourceVar(variable)
      if (variable.key) variable.key = 'oui'

      const freq_data = db.getAll('freq', { variable })
      variable.has_freq = freq_data.length > 0

      if (freq_data.length > 0) {
        const freq_sorted = [...freq_data].sort(
          (a, b) => (b.freq || 0) - (a.freq || 0),
        )
        const totalFreq = freq_data.reduce(
          (sum, item) => sum + (item.freq || 0),
          0,
        )
        const maxFreq = freq_sorted[0].freq || 1
        variable.freq_preview = freq_sorted.slice(0, 10).map(item => ({
          ...item,
          total: totalFreq,
          max: maxFreq,
        }))
      } else {
        variable.freq_preview = []
      }

      if (!nb_values || !variable.nb_duplicate) return
      variable.nb_duplicate = Math.max(variable.nb_row - nb_values, 0)
      if (variable.nb_missing) variable.nb_duplicate -= variable.nb_missing
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
      modality.nb_value = modality.values.length
      modality.values_preview = [...modality.values.slice(0, 10)]
      for (const value of modality.values) {
        value.modality_name = modality.name
        if (value.value === null) value.value = ''
        else {
          value.value = escapeHtmlEntities(value.value)
        }
      }
      if (!modality.type && modality.variables.length > 0) {
        modality.type = modality.variables[0].type
      }
      modality.type_clean = getVariableTypeClean(modality.type)
    })
  }
  static metaVariable() {
    db.foreach('metaVariable', metaVariable => {
      addEntity(metaVariable, 'metaVariable')
      metaVariable.is_meta = true
      metaVariable.type_clean = getVariableTypeClean(metaVariable.type)
      metaVariable.nb_value = getNbValues(metaVariable.values, metaVariable)
      if (metaVariable.name === 'id') metaVariable.key = 'oui'

      const metaDataset = db.get('metaDataset', metaVariable.metaDataset_id)
      metaVariable.dataset_id = metaDataset.id
      metaVariable.dataset_name = metaDataset.name
      metaVariable.nb_row = metaDataset.nb_row
      metaVariable.metaFolder_id = metaDataset.metaFolder_id
      metaVariable.folder_name = metaDataset.metaFolder_id as string
      metaVariable.meta_localisation = ''
      if (metaVariable.is_in_meta && !metaVariable.is_in_data)
        metaVariable.meta_localisation = 'schéma'
      if (!metaVariable.is_in_meta && metaVariable.is_in_data)
        metaVariable.meta_localisation = 'données'
    })
  }
  static metaDataset() {
    db.foreach('metaDataset', metaDataset => {
      addEntity(metaDataset, 'metaDataset')
      metaDataset.is_meta = true
      metaDataset.folder = { id: metaDataset.metaFolder_id }
      metaDataset.folder_name = metaDataset.metaFolder_id as string
      addVariableNum(metaDataset, 'metaDataset', 'metaVariable')
      const metaVariables = db.getAll('metaVariable', { metaDataset })
      metaDataset.nb_variable = metaVariables.length
      if (metaDataset.last_update_timestamp)
        metaDataset.last_update_timestamp *= 1000
      metaDataset.meta_localisation = ''
      if (metaDataset.is_in_meta && !metaDataset.is_in_data)
        metaDataset.meta_localisation = 'schéma'
      if (!metaDataset.is_in_meta && metaDataset.is_in_data)
        metaDataset.meta_localisation = 'données'
    })
  }
  static metaFolder() {
    db.foreach('metaFolder', metaFolder => {
      addEntity(metaFolder, 'metaFolder')
      metaFolder.is_meta = true
      const metaDatasets = db.getAll('metaDataset', { metaFolder })
      metaFolder.nb_dataset = metaDatasets.length
      metaFolder.nb_variable = 0
      for (const metaDataset of metaDatasets)
        metaFolder.nb_variable += metaDataset.nb_variable
    })
  }

  static evolution() {
    evolutionInitialSetup()
  }
}

function addDocRecursive() {
  for (const entity of ['institution', 'folder', 'dataset', 'tag'] as const) {
    db.foreach(entity, item => {
      item.docs_recursive = []
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
        item.docs_recursive.push({ ...doc, inherited: 'hérité' })
      }
      if (item.docs) item.docs_recursive = item.docs_recursive.concat(item.docs)
    })
  }
}

export function getLocalFilter() {
  const db_filters = []
  for (const config_row of db.getAll('config')) {
    if (config_row.id?.startsWith('filter_')) {
      db.use.filter = true
      db_filters.push({
        id: config_row.value?.split(':')[0]?.trim(),
        name: config_row.value?.split(':')[1]?.trim(),
      })
    }
  }
  if (db_filters.length > 0) return db_filters
  return db.getAll('filter')
}

export function dbAddProcessedData() {
  addEntitiesUsed()
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
