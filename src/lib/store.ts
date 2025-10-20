import { writable, type Writable } from 'svelte/store'
import type { ModalitySimilitute } from '@type'
import type { Tab } from '@tab/tabs-helper'

export const headerOpen = writable(false)
export const footerVisible = writable(true)
export const modalitiesSimilitutes: Writable<ModalitySimilitute[]> = writable(
  [],
)
export const nbFavorite = writable(0)
export const allTabsIcon = writable({})
export const allTabs: Writable<{ [key: string]: Tab }> = writable({})
export const allTablesLoaded = writable(false)
export const searchValue = writable('')
export const whenAppReady: Writable<Promise<void>> = writable(
  new Promise(() => {}),
)
export const tabSelected = writable({} as Tab)
