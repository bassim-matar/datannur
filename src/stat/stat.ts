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
  parseDate?: boolean
  nbRange?: number
  rangeType?: string
  nonExclusive?: string
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

function getValuesSorted(values: Record<string, ValueEntry>, sortBy = 'count') {
  const list = Object.entries(values)
  const sorted = list.map(([start, { count }]) => ({ start, count }))
  sorted.sort((a, b) => {
    if (a['start'] === '__empty__') return -1
    if (b['start'] === '__empty__') return 1
    return b[sortBy] - a[sortBy]
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
  const newValues: { start: unknown; end: unknown; count: number }[] = []
  let emptyValue = null
  for (const value of values) {
    if (value.start === '__empty__') {
      emptyValue = value
    } else {
      newValues.push({
        start: getTimeAgo(value.end),
        end: getTimeAgo(value.start),
        count: value.count,
      })
    }
  }
  if (emptyValue) newValues.push(emptyValue)
  newValues.reverse()
  return newValues
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
      attribut.parseDate &&
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
    attribut.nbRange || 10,
  ) as ValueEntry[]
  if (attribut.type === 'string')
    histogramValues = mergeZeroEmpty(histogramValues)
  if (attribut.rangeType === 'time_ago')
    histogramValues = prepareTimeAgo(histogramValues)
  return histogramValues
}

function addNonExclusive(
  items: DatabaseItem[],
  attribut: Attribut,
): ValueEntry[] {
  const set = new Set<string>()
  const values: Record<string, ValueEntry> = {}
  if (!attribut.nonExclusive) return []
  for (const item of items) {
    if (!(attribut.nonExclusive in item)) continue
    const itemValue = item[attribut.nonExclusive]
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
  sortBy = 'count',
): ValueEntry[] {
  const set = new Set<string>()
  const values: Record<string, ValueEntry> = {}
  const hasGetter = 'getValue' in attribut
  for (const item of items) {
    let value: unknown
    if (hasGetter && attribut.getValue) {
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
  return getValuesSorted(values, sortBy)
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
  let totalValue = items.length
  if (attribut.type && ['numeric', 'string'].includes(attribut.type)) {
    values = addNumeric(items, attribut)
  } else if (attribut.nonExclusive) {
    values = addNonExclusive(items, attribut)
  } else if (attribut.subtype) {
    values = addSubtype(items, attribut)
    totalValue = items.filter(attribut.subtype).length
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
  return { ...attribut, values, totalValue: totalValue }
}

export function addValues(items: DatabaseItem[], attributs: Attribut[]) {
  const attributsWithValues: (Attribut & {
    values: ValueEntry[]
    totalValue: number
  })[] = []
  for (const attribut of attributs) {
    const attributWithValues = addValuesToAttribut(items, attribut)
    if (attributWithValues) attributsWithValues.push(attributWithValues)
  }
  return attributsWithValues
}

export function statExists(entity: string, attribut: string): boolean {
  return attributs[entity]?.includes(attribut)
}
