import { allTabs } from '@tab/all-tabs'
import attributs from '@stat/attributs'
import type { Row } from '@type'
import type { Component } from 'svelte'

export type TabConfig = {
  name: string
  icon: string
  /* eslint-disable-next-line */
  component: Component<any>
  isMeta?: boolean
  metaKey?: string
  withoutProp?: boolean
  loadAsync?: boolean
  withoutNum?: boolean
  useAboutFile?: boolean
  footerVisible?: boolean
}

export type Tab = TabConfig & {
  key: string
  props: Row
  nb?: number | string
  footerVisible?: boolean
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
  const config = allTabs[key]

  if (
    ([null, undefined, false].includes(value as null | undefined | boolean) ||
      (Array.isArray(value) && value.length === 0)) &&
    !config.withoutProp
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

  const tab: Tab = { ...config, key, props: {} }

  if (Array.isArray(value) || (typeof value === 'object' && value !== null))
    tab.nb = (value as unknown[]).length

  if (config.isMeta) {
    tab.props.isMeta = true
    tab.props[config.metaKey!] = value
  } else if (value !== '') {
    tab.props[key] = value
  }

  if (config.withoutNum) {
    tab.nb = undefined
  }
  if (config.loadAsync) tab.nb = '?'

  if (config.useAboutFile) {
    tab.props = { aboutFile: value }
  }

  if (key === 'stat') {
    tab.nb = getNbStat(value as unknown[], attributs)
  }

  if (tab.footerVisible === undefined) tab.footerVisible = false

  return tab
}

export function tabsHelper(items: Row) {
  const tabs: Tab[] = []
  for (const [key, value] of Object.entries(items)) {
    const tab = getTab(key, value)
    if (!tab) continue
    tabs.push(tab)
  }
  return tabs
}
