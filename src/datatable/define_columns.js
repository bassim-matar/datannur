import { entity_names } from "@js/constant"
import { link } from "@js/util"

export function define_columns(columns, data, entity, keep_all_cols, meta_path, nb_row_loading) {
  let columns_copy = columns.map(obj => ({ ...obj }))

  if (columns_copy[0]?.title !== "#") {
    const col_numerotation = {
      data: "_row_num",
      name: "_row_num",
      title: "#",
      tooltip: "Numéro de ligne",
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

  if (!keep_all_cols)
    columns_copy = filter_empty_columns(columns_copy, data)

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

  let bold = ""
  const mini_col = ["_row_num", "level", "is_favorite", "search_receht"]
  for (const column of columns_copy) {
    if (["is_favorite", "type"].includes(column.name))
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
      if (column.data === "_entity") value = "icon_ico," + value
      cells.push(value)
    }
    const cells_width =
      Math.round(
        get_text_width(cells, `${bold} 16px "Helvetica Neue"`) * 100,
      ) / 100
    column.loading_width = Math.min(274, cells_width)
    column.loading_max_width = Math.min(274, cells_width)
  }
  return columns_copy
}