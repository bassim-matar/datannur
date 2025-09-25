import Render from '@lib/render'
import { getTimeAgo } from '@lib/time'
import Histogram from './histogram'
import { attributs } from './attributs'

interface ValueEntry {
  count: number
  start?: unknown
}

interface Attribut {
  name?: string
  type?: string
  variable?: string
  getValue?: (item: DatabaseItem) => unknown
  parse_date?: boolean
  nb_range?: number
  range_type?: string
  non_exclusive?: string
  subtype?: (item: DatabaseItem) => boolean
  icon?: string
  key?: string
}

type DatabaseItem = Record<string, unknown>

function getValueReadable(start, end) {
  if (start === 0 || start === end) return Render.num(start)
  return `${Render.num(start)} - ${Render.num(end)}`
}

function addReadableValues(values, type) {
  for (const value of values) {
    if (value.start === '__empty__') {
      value.readable = 'vide / manquant'
      continue
    }
    if (!['numeric', 'string'].includes(type)) {
      value.readable = value.start
      continue
    }
    value.readable = getValueReadable(value.start, value.end)
    if (type === 'string') {
      value.readable += ' caractère' + (value.start > 1 ? 's' : '')
    }
  }
  return values
}

function getValuesSorted(
  values: Record<string, ValueEntry>,
  sort_by = 'count',
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

function mergeZeroEmpty(values) {
  if (values[0]?.start === '__empty__' && values[1]?.start === 0) {
    values[0].count += values[1].count
    values.splice(1, 1)
  } else if (values[0]?.start === 0) {
    values[0].start = '__empty__'
  }
  return values
}

function prepareTimeAgo(values) {
  const new_values: { start: unknown; end: unknown; count: number }[] = []
  let empty_value = null
  for (const value of values) {
    if (value.start === '__empty__') {
      empty_value = value
    } else {
      new_values.push({
        start: getTimeAgo(value.end),
        end: getTimeAgo(value.start),
        count: value.count,
      })
    }
  }
  if (empty_value) new_values.push(empty_value)
  new_values.reverse()
  return new_values
}

function addNumeric(items: DatabaseItem[], attribut: Attribut): ValueEntry[] {
  const rawValues: (string | number)[] = []
  for (const item of items) {
    if (attribut.getValue) {
      const val = attribut.getValue(item)
      if (typeof val === 'string' || typeof val === 'number') {
        rawValues.push(val)
      }
    } else if (
      attribut.parse_date &&
      attribut.variable &&
      typeof item[attribut.variable] === 'string'
    ) {
      rawValues.push(Date.parse(item[attribut.variable] as string))
    } else if (attribut.variable) {
      const val = item[attribut.variable]
      if (typeof val === 'string' || typeof val === 'number') {
        rawValues.push(val)
      }
    }
  }
  let histogramValues = Histogram.get(
    rawValues,
    attribut.nb_range || 10,
  ) as ValueEntry[]
  if (attribut.type === 'string')
    histogramValues = mergeZeroEmpty(histogramValues)
  if (attribut.range_type === 'time_ago')
    histogramValues = prepareTimeAgo(histogramValues)
  return histogramValues
}

function addNonExclusive(
  items: DatabaseItem[],
  attribut: Attribut,
): ValueEntry[] {
  const set = new Set<string>()
  const values: Record<string, ValueEntry> = {}
  if (!attribut.non_exclusive) return []
  for (const item of items) {
    if (!(attribut.non_exclusive in item)) continue
    const itemValue = item[attribut.non_exclusive]
    if (Array.isArray(itemValue)) {
      for (const { name } of itemValue) {
        if (typeof name === 'string') {
          if (set.has(name)) {
            values[name].count += 1
          } else {
            values[name] = { start: name, count: 1 }
            set.add(name)
          }
        }
      }
    }
  }
  return getValuesSorted(values)
}

function addCategory(
  items: DatabaseItem[],
  attribut: Attribut,
  sort_by = 'count',
): ValueEntry[] {
  const set = new Set<string>()
  const values: Record<string, ValueEntry> = {}
  const has_getter = 'getValue' in attribut
  for (const item of items) {
    let value: unknown
    if (has_getter && attribut.getValue) {
      value = attribut.getValue(item)
    } else if (attribut.variable) {
      value = item[attribut.variable]
    } else {
      continue
    }
    if (
      [false, null, undefined, NaN, ''].includes(
        value as string | number | boolean | null | undefined,
      )
    )
      value = '__empty__'
    const key = String(value)
    if (set.has(key)) {
      values[key].count += 1
    } else {
      values[key] = { start: value, count: 1 }
      set.add(key)
    }
  }
  return getValuesSorted(values, sort_by)
}

function addSubtype(items: DatabaseItem[], attribut: Attribut): ValueEntry[] {
  const set = new Set<string>()
  const values: Record<string, ValueEntry> = {}
  for (const item of items) {
    if (!attribut.subtype || !attribut.subtype(item)) continue
    const value = attribut.getValue ? attribut.getValue(item) : ''
    const key = String(value)
    if (set.has(key)) {
      values[key].count += 1
    } else {
      values[key] = { start: value, count: 1 }
      set.add(key)
    }
  }
  return getValuesSorted(values)
}

export function addValuesToAttribut(items: DatabaseItem[], attribut: Attribut) {
  let values: ValueEntry[]
  let total_value = items.length
  if (attribut.type && ['numeric', 'string'].includes(attribut.type)) {
    values = addNumeric(items, attribut)
  } else if (attribut.non_exclusive) {
    values = addNonExclusive(items, attribut)
  } else if (attribut.subtype) {
    values = addSubtype(items, attribut)
    total_value = items.filter(attribut.subtype).length
  } else if (attribut.type === 'category_ordered') {
    values = addCategory(items, attribut, 'start')
    values.reverse()
  } else {
    values = addCategory(items, attribut)
  }
  if (values.length === 0) return
  if (
    values.length === 1 &&
    [0, '0', '__empty__'].includes(values[0].start as string | number)
  )
    return
  values = addReadableValues(values, attribut.type || '')
  return { ...attribut, values, total_value }
}

export function addValues(items: DatabaseItem[], attributs: Attribut[]) {
  const attributs_with_values: (Attribut & {
    values: ValueEntry[]
    total_value: number
  })[] = []
  for (const attribut of attributs) {
    const attribut_with_values = addValuesToAttribut(items, attribut)
    if (attribut_with_values) attributs_with_values.push(attribut_with_values)
  }
  return attributs_with_values
}

export function statExists(entity: string, attribut: string): boolean {
  return attributs[entity]?.includes(attribut)
}
