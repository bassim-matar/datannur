import db from '@db'
import { wrapLongText } from '@lib/util'
import Render from '@lib/render'

export default class PreviewManager {
  static cleanKeys(data) {
    if (typeof data === 'string') {
      return data.replaceAll('.', '_')
    }
    for (const row of data) {
      for (const [key, value] of Object.entries(row)) {
        if (key.includes('.')) {
          const clean_key = key.replaceAll('.', '_')
          row[clean_key] = value
          delete row[key]
        }
      }
    }
  }
  static addPosition(data) {
    const new_data = []
    let position = 0
    for (const row of data) {
      position += 1
      new_data.push({ '#': position, ...row })
    }
    return new_data
  }
  static getColumns(data) {
    const cols = []
    for (const [key, value] of Object.entries(data[0])) {
      let render
      if (typeof value === 'number') {
        render = data => Render.num(data)
      } else {
        render = data => wrapLongText(data)
      }
      cols.push({ data: key, title: key, defaultContent: '', render })
    }
    return cols
  }
  static getVariableData(data, variable) {
    const variable_data = []
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
    let path = 'preview'
    const dataset_id_parts = dataset_preview.split('-')
    if (dataset_id_parts.length > 1) {
      path += '/' + dataset_id_parts[0]
    }
    return await db.load(path, dataset_preview)
  }
}
