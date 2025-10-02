import { allTabs } from '@tab/all-tabs'
import attributs from '@stat/attributs'
import type { Row } from '@type'

interface TabConfig {
  key?: string
  nb?: number | string
  props?: Row
  isMeta?: boolean
  metaKey?: string
  withoutProp?: boolean
  loadAsync?: boolean
  withoutNum?: boolean
  useAboutFile?: boolean
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
    0,
  )
}

function getTab(key: string, value: unknown) {
  if (!(key in allTabs)) {
    console.error('tabsHelper():', key, 'not found')
    return false
  }
  const tab = allTabs[key] as TabConfig

  if (
    ([null, undefined, false].includes(value as null | undefined | boolean) ||
      (Array.isArray(value) && value.length === 0)) &&
    !tab.withoutProp
  )
    return false

  if (key === 'stat') {
    const total = (value as Array<{ items?: unknown[] }>).reduce(
      (acc: number, stat: { items?: unknown[] }) =>
        acc + (stat.items?.length || 0),
      0,
    )
    if (total === 0) return false
  }

  tab.key = key
  tab.nb = undefined
  if (Array.isArray(value) || (typeof value === 'object' && value !== null))
    tab.nb = (value as unknown[]).length
  tab.props = {}
  if (tab.isMeta) {
    tab.props!.isMeta = true
    tab.props![tab.metaKey!] = value
  } else if (value !== '') {
    tab.props![key] = value
  }
  if (tab.withoutNum) {
    tab.nb = undefined
  }
  if (tab.loadAsync) tab.nb = '?'

  if (tab.useAboutFile) {
    tab.props = { aboutFile: value }
  }

  if (key === 'stat') {
    tab.nb = getNbStat(value as unknown[], attributs)
  }

  return tab
}

export function tabsHelper(items: Row) {
  const tabs: TabConfig[] = []
  for (const [key, value] of Object.entries(items)) {
    const tab = getTab(key, value)
    if (!tab) continue
    tabs.push(tab)
  }
  return tabs
}
