import db from '@db'
import { whenAppReady } from '@lib/store'
import { ensureScriptLoaded } from '@lib/util'
import { get } from 'svelte/store'
import { entityNames } from '@lib/constant'
import escapeHtml from 'escape-html'
import type { Index } from 'flexsearch'
import type { EntityName, BaseEntity } from '@type'

type EntityData = { name: EntityName; items: Index; data: unknown[] }

type SearchResult = {
  id: string | number
  name: string
  description: string
  entity: string
  variable: string
  isFavorite: boolean
  folderId: string | number
  folderName: string
  _entity: string
  _entityClean: string
}

function removeDiacritics(str) {
  if (typeof str !== 'string') return str
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const charMap = {
  a: '[aâäà]',
  e: '[eéèêë]',
  i: '[iîï]',
  o: '[oôö]',
  u: '[uûü]',
  c: '[cç]',
}

export function searchHighlight(value, search) {
  if (!search || search.trim() === '') return value

  const normalizedSearch = removeDiacritics(search)
    .split('')
    .map(char => {
      const lowerChar = char.toLowerCase()
      if (charMap[lowerChar]) {
        return charMap[lowerChar]
      } else {
        return char.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
      }
    })
    .join('')

  const pattern = `(^|[^a-zA-Z])(${normalizedSearch})`
  const regex = new RegExp(pattern, 'gi')

  return escapeHtml(value).replace(regex, (match, p1, p2) => {
    return `${p1}<span class="searchHighlight">${p2}</span>`
  })
}

class Search {
  allSearch: {
    name: string
    entities: EntityData[]
  }[]
  loading: Promise<void> | null

  constructor() {
    this.allSearch = []
    this.loading = new Promise<void>(() => {})
  }
  async init() {
    this.loading = (async () => {
      await ensureScriptLoaded('assets/external/flexsearch.js')
      await get(whenAppReady)
      const variables = ['name', 'description']
      for (const variable of variables) {
        const entitiesData = []
        for (const entity in entityNames) {
          entitiesData.push({
            name: entity,
            items: new window.FlexSearch.Index({ tokenize: 'forward' }),
            data: [],
          })
        }
        this.allSearch.push({ name: variable, entities: entitiesData })
      }
      for (const variable of this.allSearch) {
        for (const entity of variable.entities) {
          db.foreach(entity.name, item => {
            if (!('name' in item)) return
            let name = String(item[variable.name] || '')
            if (
              'originalName' in item &&
              item.originalName &&
              variable.name === 'name'
            )
              name += ` (${item.originalName})`
            entity.items.add(item.id, removeDiacritics(name))
          })
        }
      }
    })()
  }
  async find(toSearch): Promise<SearchResult[]> {
    if (this.loading) await this.loading
    const result: SearchResult[] = []
    const idsFound = {}
    for (const entity in entityNames) idsFound[entity] = []
    for (const variable of this.allSearch) {
      for (const entity of variable.entities) {
        const itemsId = await this.getItemsId(toSearch, entity, idsFound)
        for (const itemId of itemsId) {
          const item = db.get(entity.name, itemId) as BaseEntity & {
            folderId?: string | number
            folderName?: string
            originalName?: string
          }
          result.push({
            id: item.id,
            name:
              item.name + (item.originalName ? ` (${item.originalName})` : ''),
            description: item.description || '',
            entity: entity.name,
            variable: variable.name,
            isFavorite: item.isFavorite || false,
            folderId: item.folderId || '',
            folderName: item.folderName || '',
            _entity: item._entity || '',
            _entityClean: entityNames[item._entity as string] || '',
          })
        }
      }
    }
    return result
  }
  async getItemsId(toSearch, entity, idsFound) {
    entity.data = []
    const normalizedSearch = removeDiacritics(toSearch)
    if (!normalizedSearch) return []
    const result = await entity.items.search(normalizedSearch, { limit: 99999 })
    const itemsId = result.filter(x => !idsFound[entity.name].includes(x))
    idsFound[entity.name] = idsFound[entity.name].concat(itemsId)
    return itemsId
  }
}

export default new Search()
