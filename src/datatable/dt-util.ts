import { UrlHash } from '@lib/url-hash'
import Options from '@lib/options'
import { getSortByName } from '@lib/db'
import { getPercent } from '@lib/util'

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
      const column_with = header.getBoundingClientRect().width
      header.style.minWidth = `${column_with}px`
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
  const table_id = hash.replaceAll('/', '___').replace(/[^a-z0-9_\-,. ]/gi, '')
  return table_id + '___' + entity
}

export function getNbItem(dt, clean_data) {
  const separator = '|'
  const nb_total = clean_data.length
  const nb_item_display = dt?.page?.info()?.recordsDisplay
  if (nb_item_display !== nb_total) {
    const percent = getPercent(nb_item_display / nb_total)
    return `${nb_item_display} / ${nb_total} ${separator} ${percent}%`
  } else {
    return nb_item_display
  }
}

export function getNbSticky(columns) {
  let nb_sticky = 1
  if (window.innerWidth > 1023) {
    for (const column of columns) {
      if (column.name === 'entity') nb_sticky += 1
      if (column.name === 'id') nb_sticky += 1
      if (column.name === 'is_favorite') nb_sticky += 1
      if (column.name === 'name') nb_sticky += 1
      if (column.name === 'evolution_type') nb_sticky += 1
    }
  }
  return nb_sticky
}

export function getCleanData(data, sort_by_name, is_recursive, is_big) {
  function getHasFilterRecursive() {
    const hash = UrlHash.getAll()
    const open_all_recursive = Options.get('open_all_recursive')
    return hash !== 'favorite' && !open_all_recursive
  }

  const has_filter_recursive = is_recursive && is_big && getHasFilterRecursive()
  const temp_data = [...data]
  const new_data = []
  if (sort_by_name) {
    temp_data.sort(getSortByName)
  }
  let row_num = 0
  for (const rows of temp_data) {
    if (
      has_filter_recursive &&
      rows.parents_relative.length - rows.minimum_deep !== 0
    ) {
      continue
    }
    row_num += 1
    const copy_rows = { ...rows }
    copy_rows._row_num = row_num
    new_data.push(copy_rows)
  }
  return new_data
}
