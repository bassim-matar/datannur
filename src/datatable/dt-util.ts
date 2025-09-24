import { UrlHash } from '@lib/url-hash'
import Options from '@lib/options'
import { get_sort_by_name } from '@lib/db'
import { get_percent } from '@lib/util'

export function is_short_table(dt) {
  return (
    dt?.page?.info()?.recordsDisplay > 0 &&
    dt?.page?.info()?.recordsDisplay < 11
  )
}

export function fix_columns_width(dt) {
  if (!dt) return false
  dt.columns()
    .header()
    .each(function (header) {
      const column_with = header.getBoundingClientRect().width
      header.style.minWidth = `${column_with}px`
    })
}

export function elem_has_clickable(target, container, selector) {
  while (target && target !== container) {
    if (target.matches(selector)) return true
    target = target.parentNode
  }
  return false
}

export function get_table_id(entity) {
  const hash = UrlHash.getAll()
  const table_id = hash.replaceAll('/', '___').replace(/[^a-z0-9_\-,. ]/gi, '')
  return table_id + '___' + entity
}

export function get_nb_item(dt, clean_data) {
  const separator = '|'
  const nb_total = clean_data.length
  const nb_item_display = dt?.page?.info()?.recordsDisplay
  if (nb_item_display !== nb_total) {
    const percent = get_percent(nb_item_display / nb_total)
    return `${nb_item_display} / ${nb_total} ${separator} ${percent}%`
  } else {
    return nb_item_display
  }
}

export function get_nb_sticky(columns) {
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

export function get_clean_data(data, sort_by_name, is_recursive, is_big) {
  function get_has_filter_recursive() {
    const hash = UrlHash.getAll()
    const open_all_recursive = Options.get('open_all_recursive')
    return hash !== 'favorite' && !open_all_recursive
  }

  const has_filter_recursive =
    is_recursive && is_big && get_has_filter_recursive()
  const temp_data = [...data]
  const new_data = []
  if (sort_by_name) {
    temp_data.sort(get_sort_by_name)
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
