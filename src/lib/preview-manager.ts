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
          const cleanKey = key.replaceAll('.', '_')
          row[cleanKey] = value
          delete row[key]
        }
      }
    }
  }
  static addPosition(data) {
    const newData = []
    let position = 0
    for (const row of data) {
      position += 1
      newData.push({ '#': position, ...row })
    }
    return newData
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
    const variableData = []
    for (const row of data) {
      for (const [key, value] of Object.entries(row)) {
        if (key === variable) {
          variableData.push({ [key]: value })
        }
      }
    }
    return variableData
  }
  static async load(datasetPreview) {
    let path = 'preview'
    const datasetIdParts = datasetPreview.split('-')
    if (datasetIdParts.length > 1) {
      path += '/' + datasetIdParts[0]
    }
    return await db.load(path, datasetPreview)
  }
}
