import { writable, derived } from "svelte/store"

export const page_hash = writable("")
export const page_name = derived(page_hash, hash => hash.split("?")[0])
export const header_open = writable(false)
export const footer_visible = writable(true)
export const is_mermaid_loaded = writable(0)
export const page_content_loaded = writable(false)
export const modalities_similitutes = writable(0)
export const nb_favorite = writable(0)
export const tab_selected = writable(0)
export const all_tabs_icon = writable({})
export const all_tables_loaded = writable(0)
export const search_value = writable("")
