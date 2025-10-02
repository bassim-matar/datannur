import { entityNames } from '@lib/constant'
import { link } from '@lib/util'
import { statExists } from '@stat/stat'
import type { ConfigColumns } from 'datatables.net'

function filterEmptyColumns(columns, items) {
  const hasProp = {}
  for (const item of items) {
    for (const key of Object.keys(item)) {
      if (key === 'id' || key === 'isFavorite') {
        hasProp[key] = true
        continue
      }
      const value = item[key]
      if (Array.isArray(value)) {
        if (value.length > 0) hasProp[key] = true
      } else if (value) hasProp[key] = true
    }
  }
  const filterColumns = columns.filter(column => column.data in hasProp)
  return filterColumns
}

function getTextWidth(lines, font) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = font
  let maxWidth = 0
  for (const line of lines) {
    const metrics = context.measureText(line)
    maxWidth = Math.max(maxWidth, metrics.width)
  }
  return maxWidth
}

export function defineColumns(
  columns,
  data,
  entity,
  keepAllCols,
  metaPath,
  nbRowLoading,
) {
  let columnsCopy = columns.map(obj => ({ ...obj }))

  if (columnsCopy[0]?.title !== '#') {
    const colNumerotation: ConfigColumns & {
      tooltip?: string
      filterType?: string
      width?: string
    } = {
      data: '_rowNum',
      name: '_rowNum',
      title: '#',
      tooltip: 'Numéro de ligne',
      filterType: 'input',
      width: '20px',
    }
    if (entity in entityNames) {
      if (metaPath) {
        colNumerotation.render = (data, type, row) => {
          return link(metaPath + row.id, data)
        }
      } else {
        colNumerotation.render = (data, type, row) => {
          return link(entity + '/' + row.id, data)
        }
      }
    }
    columnsCopy = [colNumerotation, ...columnsCopy]
  }

  if (!keepAllCols) columnsCopy = filterEmptyColumns(columnsCopy, data)

  let bold = ''
  const miniCol = [
    '_rowNum',
    'level',
    'isFavorite',
    'searchRecent',
    'evolutionType',
  ]
  for (const column of columnsCopy) {
    const key = column.name ? column.name : column.data
    if (key !== '_rowNum' && statExists(entity, key)) {
      const columnStatBtn = `
        <span class="column-stat-btn icon-stat" data-entity="${entity}" data-attribut="${key}">
          <i class="fa-solid fa-signal">
        </i></span>`
      if (column.tooltip) column.tooltip += '&nbsp;&nbsp;' + columnStatBtn
      else column.tooltip = columnStatBtn
    }

    if (column.filterType === 'select') column.searchModality = true
    if (miniCol.includes(column.name)) {
      column.loadingMaxWidth = 20
      continue
    }
    if (column.hasLongText) {
      column.loadingWidth = 274
      column.loadingMaxWidth = 274
      continue
    }
    if (column.name === 'name') bold = 'bold'
    const cells = []
    for (const row of data.slice(0, nbRowLoading)) {
      let value = row[column.data]
      if (column.fromLength) value = value.length
      if (column.data === '_entityClean') value = 'icon-ico,' + value
      cells.push(value)
    }
    const cellsWidth =
      Math.round(getTextWidth(cells, `${bold} 16px "Helvetica Neue"`) * 100) /
      100
    column.loadingWidth = Math.min(274, cellsWidth)
    column.loadingMaxWidth = Math.min(274, cellsWidth)
  }
  return columnsCopy
}
