import { entity_names } from "@js/constant"
import { link } from "@js/util"
import { stat_exists } from "@stat/stat"

function filter_empty_columns(columns, items) {
  const has_prop = {}
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (key === "id" || key === "is_favorite") {
        has_prop[key] = true
        continue
      }
      const value = item[key]
      if (Array.isArray(value)) {
        if (value.length > 0) has_prop[key] = true
      } else if (value) has_prop[key] = true
    }
  }
  const filter_columns = columns.filter(column => column.data in has_prop)
  return filter_columns
}

function get_text_width(lines, font) {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  context.font = font
  let maxWidth = 0
  for (const line of lines) {
    const metrics = context.measureText(line)
    maxWidth = Math.max(maxWidth, metrics.width)
  }
  return maxWidth
}

export function define_columns(
  columns,
  data,
  entity,
  keep_all_cols,
  meta_path,
  nb_row_loading
) {
  let columns_copy = columns.map(obj => ({ ...obj }))

  if (columns_copy[0]?.title !== "#") {
    const col_numerotation: any = {
      data: "_row_num",
      name: "_row_num",
      title: "#",
      tooltip: "Numéro de ligne",
      filter_type: "input",
      width: "20px",
    }
    if (entity in entity_names) {
      if (meta_path) {
        col_numerotation.render = (data, type, row) => {
          return link(meta_path + row.id, data)
        }
      } else {
        col_numerotation.render = (data, type, row) => {
          return link(entity + "/" + row.id, data)
        }
      }
    }
    columns_copy = [col_numerotation, ...columns_copy]
  }

  if (!keep_all_cols) columns_copy = filter_empty_columns(columns_copy, data)

  let bold = ""
  const mini_col = [
    "_row_num",
    "level",
    "is_favorite",
    "search_receht",
    "evolution_type",
  ]
  for (const column of columns_copy) {
    const key = column.name ? column.name : column.data
    if (key !== "_row_num" && stat_exists(entity, key)) {
      const column_stat_btn = `
        <span class="column_stat_btn icon_stat" data-entity="${entity}" data-attribut="${key}">
          <i class="fa-solid fa-signal">
        </i></span>`
      if (column.tooltip) column.tooltip += "&nbsp;&nbsp;" + column_stat_btn
      else column.tooltip = column_stat_btn
    }

    if(column.filter_type === "select")
      column.search_modality = true
    if (mini_col.includes(column.name)) {
      column.loading_max_width = 20
      continue
    }
    if (column.has_long_text) {
      column.loading_width = 274
      column.loading_max_width = 274
      continue
    }
    if (column.name === "name") bold = "bold"
    const cells = []
    for (const row of data.slice(0, nb_row_loading)) {
      let value = row[column.data]
      if (column.from_length) value = value.length
      if (column.data === "_entity_clean") value = "icon_ico," + value
      cells.push(value)
    }
    const cells_width =
      Math.round(get_text_width(cells, `${bold} 16px "Helvetica Neue"`) * 100) /
      100
    column.loading_width = Math.min(274, cells_width)
    column.loading_max_width = Math.min(274, cells_width)
  }
  return columns_copy
}
