import { all_tabs } from "@tab/all_tabs"

function get_tab(key, value) {
  if (!(key in all_tabs)) {
    console.error("tabs_helper():", key, "not found")
    return false
  }
  const tab = all_tabs[key]

  if (
    ([null, undefined, false].includes(value) || value.length === 0) &&
    !tab.without_prop &&
    !tab.load_async
  )
    return false

  if (key === "stat") {
    const total = value.reduce((acc, stat) => acc + stat.items?.length, 0)
    if (total === 0) return false
  }

  tab.key = key
  tab.nb = undefined
  if (typeof value === "Array" || typeof value === "object")
    tab.nb = value.length
  tab.props = {}
  if (tab.is_meta) {
    tab.props.is_meta = true
    tab.props[tab.meta_key] = value
  } else if (value !== "") {
    tab.props[key] = value
  }
  if (tab.without_num) {
    tab.nb = undefined
  }
  if (tab.load_async) tab.nb = "?"

  if (tab.use_about_file) tab.props.about_file = value
  
  return tab
}

export function tabs_helper(items) {
  const tabs = []
  for (const [key, value] of Object.entries(items)) {
    const tab = get_tab(key, value)
    if (!tab) continue
    tabs.push(tab)
  }
  return tabs
}
