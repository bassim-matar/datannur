import db from "@db"
import { get_variable_type_clean, escape_html_entities } from "@js/util"
import { get_period, date_to_timestamp, timestamp_to_date } from "@js/Time"
import { get_nb_values } from "@js/Render"
import { entity_names } from "@js/constant"
import { evolution_initial_setup } from "@js/Evolution"

function add_entities_used() {
  db.use = {}
  for (const entity of [
    "institution",
    "folder",
    "tag",
    "doc",
    "dataset",
    "variable",
    "modality",
    "filter",
    "info",
  ]) {
    db.use[entity] = is_db_using(entity)
  }
  if (db.use.institution) {
    db.use.owner = is_db_using("owner")
    db.use.manager = is_db_using("manager")
  }
  if (db.use.tag) {
    const tags = db.get_all("tag")
    if (tags.length > 0 && tags[0].parent_id !== undefined) {
      db.use.tag_recursive = true
    }
  }
}

function is_db_using(entity) {
  return db.get_all(entity).length > 0
}
function add_tags(entity, item) {
  item.tags = db.get_all("tag", { [entity]: item.id })
}
function add_parents(entity, item) {
  item.parents = db.get_parents(entity, item.id)
}
function add_favorite(item) {
  item.is_favorite = false
}
function add_nb(entity, item, entity_nb) {
  item[`nb_${entity_nb}`] = db.has_nb(entity, item.id, entity_nb)
}
function add_nb_recursive(entity, item, target) {
  item[`nb_${target}_recursive`] = get_recursive(entity, item.id, target).length
}
function add_institution_nb(institution, entity) {
  institution[`nb_${entity}`] = get_institution_items(
    institution.id,
    entity
  ).length
}
function add_nb_child(entity, item) {
  item.nb_child = db.has_nb("parent", item.id, entity)
}
function add_nb_child_recursive(entity, item) {
  const childs = db.get_all_childs(entity, item.id)
  item.nb_child_recursive = childs.length
}
function add_name(item, entity, alias = false) {
  if (!alias) alias = entity
  const item_id = item[`${alias}_id`]
  let item_name = ""
  if (item_id !== null && item_id !== undefined)
    item_name = db.get(entity, item_id)?.name
  item[`${alias}_name`] = item_name || ""
}
function add_variable_num(dataset, entity, variable_entity) {
  const variables = db.get_all(variable_entity, { [entity]: dataset.id })
  for (const [i, variable] of variables.entries()) variable.num = i + 1
}
function add_entities(item) {
  item.entities = []
  for (const entity of ["institution", "folder", "dataset"]) {
    if (item["nb_" + entity] > 0) {
      item.entities.push({ name: entity, nb: item["nb_" + entity] })
    }
  }
}
function add_period(item) {
  item.period = ""
  if (item.start_date && item.start_date === item.end_date)
    item.period = item.start_date
  else if (item.start_date && item.end_date) {
    item.period_duration = get_period(item.start_date, item.end_date, true)
    item.period = `${item.start_date} - ${item.end_date}`
  } else if (item.start_date) item.period = `dès ${item.start_date}`
  else if (item.end_date) item.period = `jusqu'à ${item.end_date}`
}

function add_docs(entity, item) {
  item.docs = db.get_all("doc", { [entity]: item.id })
  for (const doc of item.docs) {
    doc.entity = entity
    doc.entity_id = item.id
  }
}

function variable_add_dataset_info(variable) {
  const dataset = db.get("dataset", variable.dataset_id)
  if (!dataset) return
  variable.nb_row = dataset.nb_row
  variable.dataset_name = dataset.name
  variable.dataset_type = dataset.type
  variable.folder_name = ""
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

function add_entity(item, entity) {
  item._entity = entity
  item._entity_clean = entity_names[entity]
}

function add_source_var(variable) {
  if (!variable.sourceVar_ids) return false
  variable.source_ids = []
  const dataset = db.get("dataset", variable.dataset_id)
  for (const sourceVar_id_raw of variable.sourceVar_ids.split(",")) {
    const sourceVar_id = sourceVar_id_raw.trim()
    const sourceVar = db.get("variable", sourceVar_id.trim())
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
    const source_dataset = db.get("dataset", sourceVar.dataset_id)
    if (source_dataset) {
      if (!source_dataset.derived_ids) source_dataset.derived_ids = new Set()
      if (source_dataset.id !== dataset.id) {
        source_dataset.derived_ids.add(dataset.id)
      }
    }
  }
}

function add_next_update(item) {
  if (!item.last_update_date || !item.updating_each || item.no_more_update)
    return
  let diff
  const updating_each = item.updating_each.toLowerCase()
  if (updating_each === "quotidienne") diff = 24 * 3600
  else if (updating_each === "hebdomadaire") diff = 7 * (24 * 3600)
  else if (updating_each === "mensuelle") diff = 30 * (24 * 3600)
  else if (updating_each === "trimestrielle") diff = 90 * (24 * 3600)
  else if (updating_each === "semestrielle") diff = 180 * (24 * 3600)
  else if (updating_each === "annuelle") diff = 365 * (24 * 3600)
  else if (updating_each === "biennale") diff = 2 * (365 * 24 * 3600)
  else if (updating_each === "triennale") diff = 3 * (365 * 24 * 3600)
  else if (updating_each === "quadrimestrielle") diff = 4 * (365 * 24 * 3600)
  else if (updating_each === "quinquennale") diff = 5 * (365 * 24 * 3600)

  if (diff) {
    const last_update = date_to_timestamp(item.last_update_date)
    item.next_update_date = timestamp_to_date(last_update + diff * 1000)
  }
}

export function make_parents_relative(parent_id, items) {
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

function get_institution_items(institution_id, entity) {
  const own_items = db.get_all(entity, { owner: institution_id })
  const manage_items = db.get_all(entity, { manager: institution_id })
  return remove_duplicate_by_id([...own_items, ...manage_items])
}

export function get_recursive(entity, item_id, target) {
  const get =
    entity === "institution"
      ? id => get_institution_items(id, target)
      : id => db.get_all(target, { [entity]: id })
  let items = get(item_id)
  let childs = db.get_all_childs(entity, item_id)
  for (const child of childs) items = items.concat(get(child.id))
  return remove_duplicate_by_id(items)
}

export async function get_user_data() {
  return new Promise(resolve => {
    db.browser.getAll("user_data/", items => resolve(items))
  })
}

export function get_sort_by_name(a, b) {
  return a?.name?.localeCompare(b?.name)
}

export function get_parent_path(row) {
  let parents = []
  const items = "parents_relative" in row ? row.parents_relative : row.parents
  for (parent of items) {
    parents.push(parent.name)
  }
  parents.push(row.name)
  return parents.join(" / ")
}

export function remove_duplicate_by_id(items) {
  return items.filter((v, i, a) => a.findIndex(v2 => v2.id === v.id) === i)
}

export function filter_keys(list, keys) {
  return list.map(o => Object.fromEntries(keys.map(k => [k, o[k]])))
}

export function add_minimum_deep(items, no_deep = false, no_indent = false) {
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

export function get_lineage(entity, elem, lineage_type) {
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
    db.foreach("institution", institution => {
      add_entity(institution, "institution")
      add_favorite(institution)
      add_period(institution)
      add_tags("institution", institution)
      add_parents("institution", institution)
      add_docs("institution", institution)
      add_nb_child("institution", institution)
      add_nb_child_recursive("institution", institution)
      add_institution_nb(institution, "folder")
      add_institution_nb(institution, "dataset")
      add_nb_recursive("institution", institution, "folder")
      const datasets = get_recursive("institution", institution.id, "dataset")
      const variables = datasets.flatMap(dataset =>
        db.get_all("variable", { dataset })
      )
      institution.nb_dataset_recursive = datasets.length
      institution.nb_variable_recursive = variables.length
    })
  }
  static folder() {
    db.foreach("folder", folder => {
      add_entity(folder, "folder")
      add_favorite(folder)
      add_tags("folder", folder)
      add_parents("folder", folder)
      add_docs("folder", folder)
      add_nb_child("folder", folder)
      add_nb_child_recursive("folder", folder)
      add_next_update(folder)
      if (db.use.owner) add_name(folder, "institution", "owner")
      if (db.use.manager) add_name(folder, "institution", "manager")
      add_period(folder)
      const datasets = get_recursive("folder", folder.id, "dataset")
      const variables = datasets.flatMap(dataset =>
        db.get_all("variable", { dataset })
      )
      folder.nb_dataset_recursive = datasets.length
      folder.nb_variable_recursive = variables.length
    })
  }
  static tag() {
    db.foreach("tag", tag => {
      add_entity(tag, "tag")
      add_favorite(tag)
      add_nb("tag", tag, "institution")
      add_nb("tag", tag, "folder")
      add_nb("tag", tag, "dataset")
      add_nb("tag", tag, "variable")
      add_docs("tag", tag)
      add_entities(tag)
      if (db.use.tag_recursive) add_parents("tag", tag)
      add_nb_child("tag", tag)
      add_nb_child_recursive("tag", tag)
      add_nb_recursive("tag", tag, "institution")
      add_nb_recursive("tag", tag, "folder")
      add_nb_recursive("tag", tag, "doc")
      add_nb_recursive("tag", tag, "dataset")
      add_nb_recursive("tag", tag, "variable")
    })
  }
  static dataset() {
    const filters = get_local_filter()
    const filter_to_name = {}
    for (const filter of filters) {
      db.use.filter = true
      filter_to_name[filter.id] = filter.name
    }
    db.foreach("dataset", dataset => {
      add_entity(dataset, "dataset")
      add_favorite(dataset)
      add_tags("dataset", dataset)
      add_docs("dataset", dataset)
      if (db.use.owner) add_name(dataset, "institution", "owner")
      if (db.use.manager) add_name(dataset, "institution", "manager")
      if (db.use.folder) {
        add_name(dataset, "folder")
      } else dataset.folder_name = ""
      add_variable_num(dataset, "dataset", "variable")
      add_nb("dataset", dataset, "variable")
      add_period(dataset)
      add_next_update(dataset)
      dataset.type_clean = ""
      if (dataset.type) {
        dataset.type_clean = filter_to_name[dataset.type]
      }
    })
  }
  static doc() {
    db.foreach("doc", doc => {
      add_entity(doc, "doc")
      add_favorite(doc)
      add_nb("doc", doc, "institution")
      add_nb("doc", doc, "folder")
      add_nb("doc", doc, "dataset")
      add_nb("doc", doc, "tag")
      add_entities(doc)
      if (doc.last_update) doc.last_update *= 1000
      doc.last_update_date = ""
      if (doc.last_update) {
        doc.last_update_date = new Date(doc.last_update)
          .toISOString()
          .slice(0, 10)
          .replaceAll("-", "/")
      }
    })
  }
  static variable() {
    db.foreach("variable", variable => {
      add_entity(variable, "variable")
      add_favorite(variable)
      add_period(variable)
      add_tags("variable", variable)
      variable.modalities = []
      variable.values = []
      const modalities = db.get_all("modality", { variable })
      for (const modality of modalities) {
        const values = db.get_all("value", { modality })
        variable.values = variable.values.concat(values)
        variable.modalities = variable.modalities.concat(modality)
      }
      variable.values_preview = [...variable.values.slice(0, 10)]
      variable.type_clean = get_variable_type_clean(variable.type)
      variable_add_dataset_info(variable)
      const nb_values = get_nb_values(variable.values, variable)
      variable.nb_distinct = nb_values
      variable.nb_value = nb_values
      add_source_var(variable)
      if (variable.key) variable.key = "oui"
      
      // Vérifier si cette variable a des données de fréquence
      const freq_data = db.get_all("freq", { variable })
      variable.has_freq = freq_data.length > 0
      
      // Ajouter un aperçu des fréquences (max 10, triées par fréquence décroissante)
      if (freq_data.length > 0) {
        const freq_sorted = [...freq_data].sort((a, b) => (b.freq || 0) - (a.freq || 0))
        const totalFreq = freq_data.reduce((sum, item) => sum + (item.freq || 0), 0)
        const maxFreq = freq_sorted[0].freq || 1  // Fréquence maximale pour le background
        variable.freq_preview = freq_sorted.slice(0, 10).map(item => ({
          ...item,
          total: totalFreq,
          max: maxFreq
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
    db.foreach("modality", modality => {
      add_entity(modality, "modality")
      add_favorite(modality)
      add_nb("modality", modality, "variable")
      if (db.use.folder) add_name(modality, "folder")

      modality.variables = db.get_all("variable", { modality })
      modality.values = db.get_all("value", { modality })
      modality.nb_value = modality.values.length
      modality.values_preview = [...modality.values.slice(0, 10)]
      for (const value of modality.values) {
        value.modality_name = modality.name
        if (value.value === null) value.value = ""
        else {
          value.value = escape_html_entities(value.value)
        }
      }
      if (!modality.type && modality.variables.length > 0) {
        modality.type = modality.variables[0].type
      }
      modality.type_clean = get_variable_type_clean(modality.type)
    })
  }
  static metaVariable() {
    db.foreach("metaVariable", metaVariable => {
      add_entity(metaVariable, "metaVariable")
      metaVariable.is_meta = true
      metaVariable.type_clean = get_variable_type_clean(metaVariable.type)
      metaVariable.nb_value = get_nb_values(metaVariable.values, metaVariable)
      if (metaVariable.name === "id") metaVariable.key = "oui"

      const metaDataset = db.get("metaDataset", metaVariable.metaDataset_id)
      metaVariable.dataset_id = metaDataset.id
      metaVariable.dataset_name = metaDataset.name
      metaVariable.nb_row = metaDataset.nb_row
      metaVariable.metaFolder_id = metaDataset.metaFolder_id
      metaVariable.folder_name = metaDataset.metaFolder_id
      metaVariable.meta_localisation = ""
      if (metaVariable.is_in_meta && !metaVariable.is_in_data)
        metaVariable.meta_localisation = "schéma"
      if (!metaVariable.is_in_meta && metaVariable.is_in_data)
        metaVariable.meta_localisation = "données"
    })
  }
  static metaDataset() {
    db.foreach("metaDataset", metaDataset => {
      add_entity(metaDataset, "metaDataset")
      metaDataset.is_meta = true
      metaDataset.folder = { id: metaDataset.metaFolder_id }
      metaDataset.folder_name = metaDataset.metaFolder_id
      add_variable_num(metaDataset, "metaDataset", "metaVariable")
      const metaVariables = db.get_all("metaVariable", { metaDataset })
      metaDataset.nb_variable = metaVariables.length
      if (metaDataset.last_update_timestamp)
        metaDataset.last_update_timestamp *= 1000
      metaDataset.meta_localisation = ""
      if (metaDataset.is_in_meta && !metaDataset.is_in_data)
        metaDataset.meta_localisation = "schéma"
      if (!metaDataset.is_in_meta && metaDataset.is_in_data)
        metaDataset.meta_localisation = "données"
    })
  }
  static metaFolder() {
    db.foreach("metaFolder", metaFolder => {
      add_entity(metaFolder, "metaFolder")
      metaFolder.is_meta = true
      const metaDatasets = db.get_all("metaDataset", { metaFolder })
      metaFolder.nb_dataset = metaDatasets.length
      metaFolder.nb_variable = 0
      for (const metaDataset of metaDatasets)
        metaFolder.nb_variable += metaDataset.nb_variable
    })
  }

  static evolution() {
    evolution_initial_setup()
  }
}

function add_doc_recursive() {
  for (const entity of ["institution", "folder", "dataset", "tag"]) {
    db.foreach(entity, item => {
      item.docs_recursive = []
      let docs = []
      if (entity === "institution") {
        const childs = get_recursive(entity, item.id, entity)
        for (const child of childs) docs = docs.concat(child.docs)
      }
      if (["institution", "folder"].includes(entity)) {
        const folders = get_recursive(entity, item.id, "folder")
        const datasets = get_recursive(entity, item.id, "dataset")
        for (const folder of folders) docs = docs.concat(folder.docs)
        for (const dataset of datasets) docs = docs.concat(dataset.docs)
      }
      if (docs.length > 1) docs = remove_duplicate_by_id(docs)
      for (const doc of docs) {
        item.docs_recursive.push({ ...doc, inherited: "hérité" })
      }
      if (item.docs) item.docs_recursive = item.docs_recursive.concat(item.docs)
    })
  }
}

export function get_local_filter() {
  const db_filters = []
  for (const config_row of db.get_all("config")) {
    if (config_row.id?.startsWith("filter_")) {
      db.use.filter = true
      db_filters.push({
        id: config_row.value?.split(":")[0]?.trim(),
        name: config_row.value?.split(":")[1]?.trim(),
      })
    }
  }
  if (db_filters.length > 0) return db_filters
  return db.get_all("filter")
}

export function db_add_processed_data() {
  add_entities_used()
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
  if (db.use.doc) add_doc_recursive()
}
