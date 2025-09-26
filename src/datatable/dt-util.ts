import { UrlHash } from '@lib/url-hash'
import Options from '@lib/options'
import { getSortByName } from '@lib/db'
import { getPercent } from '@lib/util'
import type { Row } from '@type'

export function isShortTable(dt) {
  return (
    dt?.page?.info()?.recordsDisplay > 0 &&
    dt?.page?.info()?.recordsDisplay < 11
  )
}

export function fixColumnsWidth(dt) {
  if (!dt) return false
  dt.columns()
    .header()
    .each(function (header) {
      const columnWith = header.getBoundingClientRect().width
      header.style.minWidth = `${columnWith}px`
    })
}

export function elemHasClickable(target, container, selector) {
  while (target && target !== container) {
    if (target.matches(selector)) return true
    target = target.parentNode
  }
  return false
}

export function getTableId(entity) {
  const hash = UrlHash.getAll()
  const tableId = hash.replaceAll('/', '___').replace(/[^a-z0-9_\-,. ]/gi, '')
  return tableId + '___' + entity
}

export function getNbItem(dt, cleanData) {
  const separator = '|'
  const nbTotal = cleanData.length
  const nbItemDisplay = dt?.page?.info()?.recordsDisplay
  if (nbItemDisplay !== nbTotal) {
    const percent = getPercent(nbItemDisplay / nbTotal)
    return `${nbItemDisplay} / ${nbTotal} ${separator} ${percent}%`
  } else {
    return nbItemDisplay
  }
}

export function getNbSticky(columns) {
  let nbSticky = 1
  if (window.innerWidth > 1023) {
    for (const column of columns) {
      if (column.name === 'entity') nbSticky += 1
      if (column.name === 'isFavorite') nbSticky += 1
      if (column.name === 'name') nbSticky += 1
      if (column.name === 'evolution_type') nbSticky += 1
    }
  }
  return nbSticky
}

export function getCleanData(data, sortByName, isRecursive, isBig) {
  function getHasFilterRecursive() {
    const hash = UrlHash.getAll()
    const openAllRecursive = Options.get('open_all_recursive')
    return hash !== 'favorite' && !openAllRecursive
  }

  const hasFilterRecursive = isRecursive && isBig && getHasFilterRecursive()
  const tempData = [...data]
  const newData: Row[] = []
  if (sortByName) {
    tempData.sort(getSortByName)
  }
  let rowNum = 0
  for (const rows of tempData) {
    if (
      hasFilterRecursive &&
      rows.parentsRelative.length - rows.minimumDeep !== 0
    ) {
      continue
    }
    rowNum += 1
    const copyRows = { ...rows }
    copyRows._row_num = rowNum
    newData.push(copyRows)
  }
  return newData
}
