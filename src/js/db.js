import db from "@db"
import { get_variable_type_clean, escape_html_entities } from "@js/util"
import { get_period, date_to_timestamp, timestamp_to_date } from "@js/Time"
import { get_nb_values } from "@js/Render"
import { entity_names, history_types, parent_entities } from "@js/constant"

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
function add_has_pdf(item) {
  item.has_pdf = item.pdf ? "pdf" : ""
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
  if (item_id !== null) item_name = db.get(entity, item_id)?.name
  item[`${alias}_name`] = item_name
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

function variable_add_dataset_info(variable, dataset) {
  if (!dataset) return
  variable.nb_row = dataset.nb_row
  variable.dataset_name = dataset.name
  variable.dataset_type = dataset.type
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

class Process {
  static institution() {
    db.foreach("institution", institution => {
      add_entity(institution, "institution")
      add_favorite(institution)
      add_tags("institution", institution)
      add_parents("institution", institution)
      add_has_pdf(institution)
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
      add_has_pdf(folder)
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
      add_has_pdf(dataset)
      add_docs("dataset", dataset)
      if (db.use.owner) add_name(dataset, "institution", "owner")
      if (db.use.manager) add_name(dataset, "institution", "manager")
      if (db.use.folder) add_name(dataset, "folder")
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
      if (doc.last_update) doc.last_update = doc.last_update * 1000
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
      const dataset = db.get("dataset", variable.dataset_id)
      variable_add_dataset_info(variable, dataset)
      const nb_values = get_nb_values(variable.values, variable)
      variable.nb_distinct = nb_values
      variable.nb_value = nb_values
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
  static metaFolder() {
    db.foreach("metaFolder", metaFolder => {
      add_entity(metaFolder, "metaFolder")
      metaFolder.is_meta = true
    })
  }
  static metaDataset() {
    db.foreach("metaDataset", metaDataset => {
      add_entity(metaDataset, "metaDataset")
      metaDataset.is_meta = true
      metaDataset.folder = { id: metaDataset.metaFolder_id }
      metaDataset.folder_name = metaDataset.metaFolder_id
      add_variable_num(metaDataset, "metaDataset", "metaVariable")
    })
  }
  static metaVariable() {
    db.foreach("metaVariable", metaVariable => {
      add_entity(metaVariable, "metaVariable")
      metaVariable.is_meta = true
      metaVariable.type_clean = get_variable_type_clean(metaVariable.type)
      metaVariable.nb_value = get_nb_values(metaVariable.values, metaVariable)

      const metaDataset = db.get("metaDataset", metaVariable.metaDataset_id)
      metaVariable.dataset_id = metaDataset.id
      metaVariable.dataset_name = metaDataset.name
      metaVariable.nb_row = metaDataset.nb_row
      metaVariable.metaFolder_id = metaDataset.metaFolder_id
      metaVariable.folder_name = metaDataset.metaFolder_id
    })
  }
  static history() {
    function get_item(entity, entity_id, history_deleted) {
      if (db.table_has_id(entity, entity_id)) {
        const item = db.get(entity, entity_id)
        item._deleted = false
        item.parent_entity_id = item[`${parent_entities[entity]}_id`]
        return item
      }
      const item = history_deleted[entity]?.[entity_id]
      if (item) {
        item._deleted = true
        return item
      }
      return null
    }

    const history_deleted = {}
    db.foreach("history", history => {
      if (history.type === "delete") {
        if (!(history.entity in history_deleted)) {
          history_deleted[history.entity] = {}
        }
        history_deleted[history.entity][history.entity_id] = history
      }
    })

    db.foreach("history", history => {
      const item = get_item(history.entity, history.entity_id, history_deleted)
      if (item && item.name) {
        history.name = item.name
        history.parent_entity_id = item.parent_entity_id
        history._deleted = item._deleted
        history.id = item.id
      } else if (history.entity === "value") {
        history._deleted = true
        history.parent_entity_id = history.entity_id.split("---")[0]
        history.name = history.entity_id
        if (history.name.includes("---")) {
          history.name = history.name.split("---")[1]
        }
      } else {
        history.name = history.entity_id
        history._deleted = true
      }

      const parent_entity =
        parent_entities[history.entity] === "parent"
          ? history.entity
          : parent_entities[history.entity]

      history._entity = history.entity
      history._entity_clean = entity_names[history.entity]
      history.type_clean = history_types[history.type]
      history.parent_entity = parent_entity
      history.parent_entity_clean = entity_names[parent_entity]
      history.timestamp *= 1000
      history.time = history.timestamp > Date.now() ? "Futur" : "Passé"

      const parent_item = get_item(
        history.parent_entity,
        history.parent_entity_id,
        history_deleted
      )
      history.parent_name = parent_item?.name
      history.parent_deleted = parent_item?._deleted
      history.is_favorite = false
    })

    function add_validity(validities, type, entity, entity_data) {
      const parent_entity =
        parent_entities[entity] === "parent" ? entity : parent_entities[entity]
      const parent_item = get_item(
        parent_entity,
        entity_data[`${parent_entities[entity]}_id`],
        history_deleted
      )

      const timestamp = date_to_timestamp(
        entity_data[type],
        type === "start_date" ? "start" : "end"
      )

      const time = timestamp > Date.now() ? "Futur" : "Passé"

      let type_clean = "Autre"
      if (type in history_types) type_clean = history_types[type]
    
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
        is_favorite: false,
      })
    }

    const validities = []
    const entities = Object.keys(parent_entities)
    for (const entity of entities) {
      if (
        db.tables[entity].length > 0 &&
        (Object.keys(db.tables[entity][0]).includes("start_date") ||
          Object.keys(db.tables[entity][0]).includes("end_date") ||
          Object.keys(db.tables[entity][0]).includes("last_update_date") ||
          Object.keys(db.tables[entity][0]).includes("next_update_date"))
      ) {
        db.foreach(entity, entity_data => {
          if (entity_data.start_date) {
            add_validity(validities, "start_date", entity, entity_data)
          }
          if (entity_data.end_date) {
            add_validity(validities, "end_date", entity, entity_data)
          }
          if (entity_data.last_update_date) {
            add_validity(validities, "last_update_date", entity, entity_data)
          }
          if (entity_data.next_update_date) {
            add_validity(validities, "next_update_date", entity, entity_data)
          }
        })
      }
    }

    if (!db.tables.history) db.tables.history = []
    for (const validity of validities) {
      db.tables.history.push(validity)
    }
  }
}

function add_doc_recursive() {
  for (const entity of ["institution", "folder", "dataset", "tag"]) {
    db.foreach(entity, item => {
      let docs = []
      if (item.docs) docs = [...item.docs]
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
      item.docs_recursive = docs
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
  Process.metaFolder()
  Process.metaDataset()
  Process.metaVariable()
  Process.history()
  if (db.use.doc) add_doc_recursive()
}
