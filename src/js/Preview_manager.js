import db from "@db"
import { wrap_long_text } from "@js/util"
import Render from "@js/Render"

export default class Preview_manager {
  static clean_keys(data) {
    if (typeof data === "string") {
      return data.replaceAll(".", "_")
    }
    for (const row of data) {
      for (const [key, value] of Object.entries(row)) {
        if (key.includes(".")) {
          const clean_key = key.replaceAll(".", "_")
          row[clean_key] = value
          delete row[key]
        }
      }
    }
  }
  static add_position(data) {
    const new_data = []
    let position = 0
    for (let row of data) {
      position += 1
      new_data.push({ "#": position, ...row })
    }
    return new_data
  }
  static get_columns(data) {
    const cols = []
    for (const [key, value] of Object.entries(data[0])) {
      let render
      if (typeof value === "number") {
        render = (data) => Render.num(data)
      } else {
        render = (data) => wrap_long_text(data)
      }
      cols.push({ data: key, title: key, defaultContent: "", render })
    }
    return cols
  }
  static get_variable_data(data, variable) {
    let variable_data = []
    let position = 0
    for (const row of data) {
      position += 1
      for (const [key, value] of Object.entries(row)) {
        if (key === variable) {
          variable_data.push({ [key]: value })
        }
      }
    }
    return variable_data
  }
  static async load(dataset_preview) {
    let path = "preview"
    let dataset_id_parts = dataset_preview.split("-")
    if (dataset_id_parts.length > 1) {
      path += "/" + dataset_id_parts[0]
    }
    return await db.load(path, dataset_preview)
  }
}
