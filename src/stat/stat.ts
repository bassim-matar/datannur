import Render from '@lib/render'
import { get_time_ago } from '@lib/time'
import Histogram from './histogram'
import { attributs } from './attributs'

interface ValueEntry {
  count: number
  start?: any
}

function get_value_readable(start, end) {
  if (start === 0 || start === end) return Render.num(start)
  return `${Render.num(start)} - ${Render.num(end)}`
}

function add_readable_values(values, type) {
  for (const value of values) {
    if (value.start === '__empty__') {
      value.readable = 'vide / manquant'
      continue
    }
    if (!['numeric', 'string'].includes(type)) {
      value.readable = value.start
      continue
    }
    value.readable = get_value_readable(value.start, value.end)
    if (type === 'string') {
      value.readable += ' caractère' + (value.start > 1 ? 's' : '')
    }
  }
  return values
}

function get_values_sorted(
  values: Record<string, ValueEntry>,
  sort_by = 'count'
) {
  const list = Object.entries(values)
  const sorted = list.map(([start, { count }]) => ({ start, count }))
  sorted.sort((a, b) => {
    if (a['start'] === '__empty__') return -1
    if (b['start'] === '__empty__') return 1
    return b[sort_by] - a[sort_by]
  })

  return sorted
}

function merge_zero_empty(values) {
  if (values[0]?.start === '__empty__' && values[1]?.start === 0) {
    values[0].count += values[1].count
    values.splice(1, 1)
  } else if (values[0]?.start === 0) {
    values[0].start = '__empty__'
  }
  return values
}

function prepare_time_ago(values) {
  const new_values = []
  let empty_value = null
  for (const value of values) {
    if (value.start === '__empty__') {
      empty_value = value
    } else {
      new_values.push({
        start: get_time_ago(value.end),
        end: get_time_ago(value.start),
        count: value.count,
      })
    }
  }
  if (empty_value) new_values.push(empty_value)
  new_values.reverse()
  return new_values
}

function add_numeric(items, attribut) {
  let values = []
  for (const item of items) {
    if (attribut.get_value) {
      values.push(attribut.get_value(item))
    } else if (attribut.parse_date && item[attribut.variable]) {
      values.push(Date.parse(item[attribut.variable]))
    } else {
      values.push(item[attribut.variable])
    }
  }
  values = Histogram.get(values, attribut.nb_range || 10)
  if (attribut.type === 'string') values = merge_zero_empty(values)
  if (attribut.range_type === 'time_ago') values = prepare_time_ago(values)
  return values
}

function add_non_exclusive(items, attribut) {
  const set = new Set()
  const values = {}
  for (const item of items) {
    if (!(attribut.non_exclusive in item)) continue
    for (const { name } of item[attribut.non_exclusive]) {
      if (set.has(name)) {
        values[name].count += 1
      } else {
        values[name] = { start: name, count: 1 }
        set.add(name)
      }
    }
  }
  return get_values_sorted(values)
}

function add_category(items, attribut, sort_by = 'count') {
  const set = new Set()
  const values = {}
  const has_getter = 'get_value' in attribut
  for (const item of items) {
    let value = has_getter ? attribut.get_value(item) : item[attribut.variable]
    if ([false, null, undefined, NaN, ''].includes(value)) value = '__empty__'
    if (set.has(value)) {
      values[value].count += 1
    } else {
      values[value] = { start: value, count: 1 }
      set.add(value)
    }
  }
  return get_values_sorted(values, sort_by)
}

function add_subtype(items, attribut) {
  const set = new Set()
  const values = {}
  for (const item of items) {
    if (!attribut.subtype(item)) continue
    const value = attribut.get_value(item)
    if (set.has(value)) {
      values[value].count += 1
    } else {
      values[value] = { start: value, count: 1 }
      set.add(value)
    }
  }
  return get_values_sorted(values)
}

export function add_values_to_attribut(items, attribut) {
  let values
  let total_value = items.length
  if (['numeric', 'string'].includes(attribut.type)) {
    values = add_numeric(items, attribut)
  } else if (attribut.non_exclusive) {
    values = add_non_exclusive(items, attribut)
  } else if (attribut.subtype) {
    values = add_subtype(items, attribut)
    total_value = items.filter(attribut.subtype).length
  } else if (attribut.type === 'category_ordered') {
    values = add_category(items, attribut, 'start')
    values.reverse()
  } else {
    values = add_category(items, attribut)
  }
  if (values.length === 0) return
  if (values.length === 1 && [0, '0', '__empty__'].includes(values[0].start))
    return
  values = add_readable_values(values, attribut.type)
  return { ...attribut, values, total_value }
}

export function add_values(items, attributs) {
  const attributs_with_values = []
  for (const attribut of attributs) {
    const attribut_with_values = add_values_to_attribut(items, attribut)
    if (attribut_with_values) attributs_with_values.push(attribut_with_values)
  }
  return attributs_with_values
}

export function stat_exists(entity, attribut) {
  return attributs[entity]?.includes(attribut)
}
