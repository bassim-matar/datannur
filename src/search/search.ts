import db from '@db'
import { entityNames } from '@lib/constant'
import { escapeHtmlEntities } from '@lib/util'
import type { Index } from 'flexsearch'
import type { EntityName, BaseEntity } from '@type'

function ensureFlexsearchLoaded() {
  return new Promise<void>(resolve => {
    const flexsearchSrc = `assets/external/flexsearch.js?v=${__APP_VERSION__}`
    if (document.querySelector(`script[src="${flexsearchSrc}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    const scriptAttributes = { src: flexsearchSrc, onload: resolve }
    document.head.appendChild(Object.assign(script, scriptAttributes))
  })
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

  return escapeHtmlEntities(value).replace(regex, (match, p1, p2) => {
    return `${p1}<span class="searchHighlight">${p2}</span>`
  })
}

type EntityData = { name: EntityName; items: Index; data: unknown[] }

export default class Search {
  allSearch: {
    name: string
    entities: EntityData[]
  }[]
  loading: Promise<void> | null

  constructor() {
    this.allSearch = []
    this.loading = null
  }
  async init() {
    this.loading = (async () => {
      await ensureFlexsearchLoaded()
      if (db.loaded) await db.loaded
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
              'original_name' in item &&
              item.original_name &&
              variable.name === 'name'
            )
              name += ` (${item.original_name})`
            entity.items.add(item.id, removeDiacritics(name))
          })
        }
      }
    })()
  }
  async search(toSearch) {
    if (this.loading) await this.loading
    const result = []
    const idsFound = {}
    for (const entity in entityNames) idsFound[entity] = []
    for (const variable of this.allSearch) {
      for (const entity of variable.entities) {
        const itemsId = await this.getItemsId(toSearch, entity, idsFound)
        for (const itemId of itemsId) {
          const item = db.get(entity.name, itemId) as BaseEntity & {
            folder_id?: string | number
            folderName?: string
            original_name?: string
          }
          result.push({
            id: item.id,
            name:
              item.name +
              (item.original_name ? ` (${item.original_name})` : ''),
            description: item.description || '',
            entity: entity.name,
            variable: variable.name,
            isFavorite: item.isFavorite || false,
            folder_id: item.folder_id || '',
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
