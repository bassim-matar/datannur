import { allTabs } from '@tab/all-tabs'
import attributs from '@stat/attributs'

interface TabConfig {
  key?: string
  nb?: number | string
  props?: Record<string, unknown>
  is_meta?: boolean
  meta_key?: string
  without_prop?: boolean
  load_async?: boolean
  without_num?: boolean
  use_about_file?: boolean
  [key: string]: unknown
}

function getNbStat(stat: unknown[], attributs: Record<string, unknown[]>) {
  return (stat as Array<{ entity: string; items?: unknown[] }>).reduce(
    (acc: number, entity) => {
      if (entity.items?.length) {
        return acc + ((attributs[entity.entity] as unknown[])?.length || 0)
      }
      return acc
    },
    0
  )
}

function getTab(key: string, value: unknown) {
  if (!(key in allTabs)) {
    console.error('tabs_helper():', key, 'not found')
    return false
  }
  const tab = allTabs[key] as TabConfig

  if (
    ([null, undefined, false].includes(value as null | undefined | boolean) ||
      (Array.isArray(value) && value.length === 0)) &&
    !tab.without_prop &&
    !tab.load_async
  )
    return false

  if (key === 'stat') {
    const total = (value as Array<{ items?: unknown[] }>).reduce(
      (acc: number, stat: { items?: unknown[] }) =>
        acc + (stat.items?.length || 0),
      0
    )
    if (total === 0) return false
  }

  tab.key = key
  tab.nb = undefined
  if (Array.isArray(value) || (typeof value === 'object' && value !== null))
    tab.nb = (value as unknown[]).length
  tab.props = {}
  if (tab.is_meta) {
    tab.props!.is_meta = true
    tab.props![tab.meta_key!] = value
  } else if (value !== '') {
    tab.props![key] = value
  }
  if (tab.without_num) {
    tab.nb = undefined
  }
  if (tab.load_async) tab.nb = '?'

  if (tab.use_about_file) {
    tab.props = { about_file: value }
  }

  if (key === 'stat') {
    tab.nb = getNbStat(value as unknown[], attributs)
  }

  return tab
}

export function tabsHelper(items: Record<string, unknown>) {
  const tabs = []
  for (const [key, value] of Object.entries(items)) {
    const tab = getTab(key, value)
    if (!tab) continue
    tabs.push(tab)
  }
  return tabs
}
