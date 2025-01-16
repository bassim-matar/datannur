import db from "@db"
import { locale } from "@js/constant"
import { copy_text_classes, copy_text_msg } from "@js/copy_text"
import { get_time_ago, date_to_timestamp } from "@js/Time"
import {
  link,
  wrap_long_text,
  add_indend,
  entity_to_icon_name,
  get_percent,
} from "@js/util"

export function get_nb_values(values, row) {
  if (values && values.length) return values.length
  if (row.nb_distinct) return row.nb_distinct
  return ""
}

const separator = " | "

export default class Render {
  static parents_indent(data, type, row) {
    return Render.tree(row._entity, [...data].reverse(), type)
  }
  static tree(entity, elements, type = "normal") {
    let content = ""
    let level = 0
    for (const element of elements) {
      if (!element) continue
      let name = element.name
      if (level > 0 && type === "export") name = separator + name
      content += link(entity + "/" + element.id, add_indend(name, level))
      level += 1
    }
    return wrap_long_text(`<div class="tree">${content}</div>`)
  }
  static with_parents_from_id(entity, id, type) {
    if (id === null) return ""
    const element = db.get(entity, id)
    const parents = db.get_parents(entity, id)
    const elements = [...parents, element].reverse()
    return Render.tree(entity, elements, type)
  }
  static first_parent(data, type, row) {
    if (data.length === 0) return wrap_long_text()
    const parent = data.slice(-1)[0]
    return wrap_long_text(link(row._entity + "/" + parent.id, parent.name))
  }
  static value(values, type, row) {
    if (!values || values === "" || values.length === 0) return wrap_long_text()
    const nb_values = row.values.length
    let entity = "dataset_id" in row ? "variable" : "modality"
    let tab = entity === "variable" ? "variable_values" : "values"
    if (row._entity === "metaVariable") {
      entity = "metaVariable"
      tab = "variable_metaValues"
    }
    let content = '<ul class="ul_value">'
    let i = 0
    for (const value of values) {
      let value_content = value.value
      if (value.description && value.description !== "") {
        value_content += " : " + value.description
      }
      if (i > 0 && type === "export") value_content = separator + value_content
      content += "<li>" + value_content + "</li>"
      i += 1
    }
    if (nb_values > values.length) {
      const nb_other_values = nb_values - values.length
      const s = nb_other_values > 1 ? "s" : ""
      const text = link(
        `${entity}/${row.id}?tab=${tab}`,
        `... ${nb_other_values} autre${s} valeur${s}`
      )
      if (type === "export") content += separator
      content += `<li><i>${text}</i></li>`
    }
    content += "</ul>"
    return wrap_long_text(content)
  }
  static num(data, type = "normal") {
    if (data === false || data === undefined || data === null) return ""
    if (["filter", "sort", "export"].includes(type)) return data
    return data.toLocaleString(locale)
  }
  static num_no_empty(data, type = "normal") {
    if (!data) return ""
    return Render.num(data, type)
  }
  static favorite(data, type, row, meta) {
    if (type === "sort" || type === "filter" || type === "export") {
      return row.is_favorite ? "favoris" : "non favoris"
    }
    return `
      <span class="icon favorite ${data ? " is-active" : ""}"
        data-id="${row.id}"
        data-entity="${row._entity}"
        data-is_favorite="${row.is_favorite}"
        data-col="${meta.col}"
        data-row="${meta.row}">
        <i class="fas fa-star"></i>
      </span>`
  }
  static icon(entity) {
    let class_names
    let icon = entity_to_icon_name(entity)
    if (icon.startsWith("fa-brands")) {
      class_names = icon
    } else {
      class_names = `fas fa-${icon}`
    }
    return `<span class='icon icon_${entity}'><i class='${class_names}'></i></span>`
  }
  static modalities_name(modalities) {
    if (!modalities || modalities.length === 0) return wrap_long_text()
    let modalities_name = []
    for (const modality of modalities) {
      modalities_name.push(link("modality/" + modality.id, modality.name))
    }
    return wrap_long_text(modalities_name.join(" | "))
  }
  static nb_values(data, type, row, nb_value_max) {
    const nb_values = data
    let entity = "dataset_id" in row ? "variable" : "modality"
    let tab = entity === "variable" ? "variable_values" : "values"
    if (row._entity === "metaVariable") {
      entity = "metaVariable"
      tab = "variable_metaValues"
    }
    if (type !== "display") return nb_values
    const percent = get_percent(nb_values / nb_value_max)
    let content = Render.num(nb_values)
    if (nb_values) {
      content = link(`${entity}/${row.id}?tab=${tab}`, content)
    }
    return `${Render.num_percent(content, percent, "value", type)}`
  }
  static nb_duplicate(nb_duplicate, type, row) {
    if (!nb_duplicate) return ""
    const percent = get_percent(nb_duplicate / row.nb_row)
    return `${Render.num_percent(nb_duplicate, percent, "duplicate", type)}`
  }
  static nb_missing(nb_missing, type, row, stringify = true) {
    if (!row.nb_row) return ""
    if (!nb_missing) return ""
    const percent = get_percent(nb_missing / row.nb_row)
    const content = Render.num_percent(
      nb_missing,
      percent,
      "missing",
      type,
      true
    )
    if (stringify) return `${content}`
    return content
  }
  static num_percent(data, percent, color_type, type, with_percent = false) {
    let display_value = Render.num(data, type)
    if (type === "display" && with_percent) display_value += ` (${percent}%)`
    return `
      <span>${display_value}</span>
      <span class="num_percent color_${color_type}" style="width: ${percent}%"></span>`
  }
  static tags(tags) {
    if (!tags || tags.length === 0) return wrap_long_text()
    let tags_name = []
    for (const tag of tags) {
      tags_name.push(link("tag/" + tag.id, tag.name))
    }
    return wrap_long_text(tags_name.join(" | "))
  }
  static copy_cell(data, type) {
    if (!data) return wrap_long_text()
    if (type !== "display") return data
    return wrap_long_text(
      `<span class="${copy_text_classes}" title="${copy_text_msg}">${data}</span>`
    )
  }
  static datetime(data, type, row, option) {
    if (!data) return ""
    if (type !== "display") return data

    let content_after = ""
    if (option?.estimation) {
      content_after = ` <span style="font-size: 12px;">(estim.)</span>`
    }
    const time_ago = get_time_ago(data, true, true)
    const timestamp = date_to_timestamp(data, "start")
    const content = `${time_ago}<br>${data}${content_after}`
    const percent = get_percent(
      (new Date().getTime() - timestamp) / 31536000000
    )
    const entity = percent < 0 ? "value" : "doc"
    const percent_abs_inversed = 100 - Math.abs(percent)
    return `${Render.num_percent(content, percent_abs_inversed, entity, type)}`
  }
}
