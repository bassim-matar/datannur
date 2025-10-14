import { writable, derived, type Writable } from 'svelte/store'
import type { ModalitySimilitute, Row } from '@type'
import type { Tab } from '@tab/tabs-helper'

export const page = writable('')
export const onPageHomepage = derived(page, p => p === '_index')
export const onPageSearch = derived(page, p => p === 'search')
export const pageHash = writable('')
export const headerOpen = writable(false)
export const isSmallMenu = writable(false)
export const footerVisible = writable(true)
export const pageContentLoaded = writable(false)
export const modalitiesSimilitutes: Writable<ModalitySimilitute[]> = writable(
  [],
)
export const nbFavorite = writable(0)
export const allTabsIcon = writable({})
export const allTabs: Writable<{ [key: string]: Tab }> = writable({})
export const allTablesLoaded = writable(false)
export const searchValue = writable('')
export const reloadIncrement = writable(0)
export const currentTabData: Writable<Row[]> = writable([])
export const whenAppReady: Writable<Promise<void>> = writable(
  new Promise(() => {}),
)
export const tabSelected = writable({} as Tab)
