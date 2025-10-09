import { UrlHash } from '@lib/url-hash'
import Options from '@lib/options'
import { getPercent } from '@lib/util'
import type { AnyEntity, Column } from '@type'
import type { Api } from 'datatables.net'

export function isShortTable(dt: Api) {
  return (
    dt?.page?.info()?.recordsDisplay > 0 &&
    dt?.page?.info()?.recordsDisplay < 11
  )
}

export function fixColumnsWidth(dt: Api) {
  if (!dt) return false
  dt.columns()
    .header()
    .each(function (header) {
      const columnWith = header.getBoundingClientRect().width
      header.style.minWidth = `${columnWith}px`
    })
}

export function elemHasClickable(
  target: HTMLElement,
  container: HTMLElement,
  selector: string,
) {
  while (target && target !== container) {
    if (target.matches(selector)) return true
    target = target.parentNode as HTMLElement
  }
  return false
}

export function getTableId(entity: string) {
  const hash = UrlHash.getAll()
  const tableId = hash.replaceAll('/', '___').replace(/[^a-z0-9_\-,. ]/gi, '')
  return tableId + '___' + entity
}

export function getNbItem(dt: Api, cleanData: AnyEntity[]) {
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

export function getNbSticky(columns: Column[]) {
  let nbSticky = 1
  if (window.innerWidth > 1023) {
    for (const column of columns) {
      if (column.name === 'entity') nbSticky += 1
      if (column.name === 'isFavorite') nbSticky += 1
      if (column.name === 'name') nbSticky += 1
      if (column.name === 'evolutionType') nbSticky += 1
    }
  }
  return nbSticky
}

export function getCleanData(
  data: AnyEntity[],
  sortByName: boolean,
  isRecursive: boolean,
  isBig: boolean,
) {
  function getHasFilterRecursive() {
    const hash = UrlHash.getAll()
    const openAllRecursive = Options.get('openAllRecursive')
    return hash !== 'favorite' && !openAllRecursive
  }

  const hasFilterRecursive = isRecursive && isBig && getHasFilterRecursive()
  const tempData = [...data]
  const newData: (AnyEntity & { _rowNum: number })[] = []
  if (sortByName) {
    tempData.sort((a, b) => {
      const aName = ('name' in a ? a.name : '') ?? ''
      const bName = ('name' in b ? b.name : '') ?? ''
      return aName.localeCompare(bName)
    })
  }
  let rowNum = 0
  for (const rows of tempData) {
    if (
      hasFilterRecursive &&
      'parentsRelative' in rows &&
      'minimumDeep' in rows &&
      rows.parentsRelative &&
      rows.minimumDeep !== undefined &&
      rows.parentsRelative.length - rows.minimumDeep !== 0
    ) {
      continue
    }
    rowNum += 1
    newData.push({ ...rows, _rowNum: rowNum })
  }
  return newData
}
