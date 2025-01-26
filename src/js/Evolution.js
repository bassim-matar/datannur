import db from "@db"
import { entity_names, evolution_types, parent_entities } from "@js/constant"
import { date_to_timestamp, convert_quarter_to_full_date } from "@js/Time"
import { diffWords } from "diff"
import { get_period } from "@js/Time"
import { split_on_last_separator } from "@js/util"

const arrow_right = `<i class="fas fa-arrow-right"></i>`

function get_evo_deleted() {
  const evo_deleted = {}
  db.foreach("evolution", evo => {
    if (evo.type === "delete") {
      if (!(evo.entity in evo_deleted)) {
        evo_deleted[evo.entity] = {}
      }
      evo_deleted[evo.entity][evo.entity_id] = evo
    }
  })
  return evo_deleted
}

function get_item(entity, entity_id, evo_deleted) {
  if (db.table_has_id(entity, entity_id)) {
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

function add_history(evo_deleted) {
  db.foreach("evolution", evo => {
    const item = get_item(evo.entity, evo.entity_id, evo_deleted)
    if (item && item.name) {
      evo.name = item.name
      evo.parent_entity_id = item.parent_entity_id
      evo._deleted = item._deleted
      evo.id = item.id
    } else if (evo.entity === "value") {
      const [id, value] = split_on_last_separator(evo.entity_id, "---")
      evo._deleted = true
      evo.parent_entity_id = id
      evo.name = value ? value : evo.entity_id
    } else {
      evo.name = evo.entity_id
      evo._deleted = true
      evo._to_hide = true
    }

    const parent_entity =
      parent_entities[evo.entity] === "parent"
        ? evo.entity
        : parent_entities[evo.entity]

    evo._entity = evo.entity
    evo._entity_clean = entity_names[evo.entity]
    evo.type_clean = evolution_types[evo.type]
    evo.parent_entity = parent_entity
    evo.parent_entity_clean = entity_names[parent_entity]
    evo.timestamp *= 1000
    evo.time = evo.timestamp > Date.now() ? "Futur" : "Passé"

    const parent_item = get_item(
      evo.parent_entity,
      evo.parent_entity_id,
      evo_deleted
    )
    evo.parent_name = parent_item?.name
    evo.parent_deleted = parent_item?._deleted
    evo.is_favorite = false
  })

  db.tables.evolution = db.tables.evolution?.filter(evo => !evo._to_hide)
}

function add_validity(validities, type, entity, entity_data, evo_deleted) {
  const parent_entity =
    parent_entities[entity] === "parent" ? entity : parent_entities[entity]
  const parent_item = get_item(
    parent_entity,
    entity_data[`${parent_entities[entity]}_id`],
    evo_deleted
  )

  const timestamp = date_to_timestamp(
    entity_data[type],
    type === "start_date" ? "start" : "end"
  )

  const time = timestamp > Date.now() ? "Futur" : "Passé"

  let type_clean = "Autre"
  if (type in evolution_types) type_clean = evolution_types[type]

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

function add_validities(evo_deleted) {
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
          add_validity(
            validities,
            "start_date",
            entity,
            entity_data,
            evo_deleted
          )
        }
        if (entity_data.end_date) {
          add_validity(validities, "end_date", entity, entity_data, evo_deleted)
        }
        if (entity_data.last_update_date) {
          add_validity(
            validities,
            "last_update_date",
            entity,
            entity_data,
            evo_deleted
          )
        }
        if (entity_data.next_update_date) {
          add_validity(
            validities,
            "next_update_date",
            entity,
            entity_data,
            evo_deleted
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

export function evolution_initial_setup() {
  const evo_deleted = get_evo_deleted()
  add_history(evo_deleted)
  add_validities(evo_deleted)
}

function parse_date_standard(dateString) {
  if (dateString.length === 6 && dateString[4] === "t") {
    dateString = convert_quarter_to_full_date(dateString, "start")
  }
  const parts = dateString.split("/")
  if (parts.length === 2) parts.push(1)
  if (parts.length !== 3) return null
  const [year, month, day] = parts.map(Number)
  if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return new Date(year, month - 1, day)
  }
  return null
}

function output_diff_number(oldVal, newVal) {
  const diff = newVal - oldVal
  const percentageChange =
    oldVal !== 0 ? ((diff / oldVal) * 100).toFixed(1) : "∞"
  const diffClass = diff > 0 ? "highlight_diff_add" : "highlight_diff_delete"

  return `${oldVal.toLocaleString()} --> ${newVal.toLocaleString()} 
      <br><span class="${diffClass}">${
    diff > 0 ? "+" : ""
  }${diff.toLocaleString()} | 
      ${diff > 0 ? "+" : ""}${percentageChange}%</span>
  `
}

function output_diff_date(oldDate, newDate, old_date_string, new_date_string) {
  const diffDays = Math.ceil((newDate - oldDate) / (1000 * 60 * 60 * 24))
  const diffClass =
    diffDays > 0 ? "highlight_diff_add" : "highlight_diff_delete"

  const diff_relative = get_period(oldDate, newDate, true)

  return `
  ${old_date_string} ${arrow_right} ${new_date_string}
  <br><span class="${diffClass}">${
    diffDays > 0 ? "+" : ""
  }${diff_relative}</span>`
}

function output_diff_string(oldVal, newVal) {
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
    .join("")
}

export function highlight_diff(a, b) {
  if (!a && !b) return ""

  a = a ? a.toString() : ""
  b = b ? b.toString() : ""

  let oldDate = null
  let newDate = null
  let is_a_number = !isNaN(a)
  let is_b_number = !isNaN(b)

  if (!is_a_number) {
    oldDate = parse_date_standard(a)
  } else {
    a = parseFloat(a)
    if (a > 1800 && a < 2100) {
      oldDate = new Date(a, 0, 1)
    }
  }

  if (!is_b_number) {
    newDate = parse_date_standard(b)
  } else {
    b = parseFloat(b)
    if (b > 1800 && b < 2100) {
      newDate = new Date(b, 0, 1)
    }
  }

  if (oldDate && newDate) return output_diff_date(oldDate, newDate, a, b)
  if (is_a_number && is_b_number) return output_diff_number(a, b)
  if (is_a_number) a = a.toString()
  if (is_b_number) b = b.toString()
  return output_diff_string(a, b)
}
