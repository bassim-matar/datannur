import db from '@db'
import { entity_names } from '@lib/constant'
import { escape_html_entities } from '@lib/util'

function ensure_flexsearch_loaded() {
  return new Promise<void>(resolve => {
    const flexsearch_src = `assets/external/flexsearch.js?v=${__APP_VERSION__}`
    if (document.querySelector(`script[src="${flexsearch_src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    const script_attributes = { src: flexsearch_src, onload: resolve }
    document.head.appendChild(Object.assign(script, script_attributes))
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

export function search_highlight(value, search) {
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

  return escape_html_entities(value).replace(regex, (match, p1, p2) => {
    return `${p1}<span class="search_highlight">${p2}</span>`
  })
}

export default class Search {
  all_search: any[]
  loading: Promise<void> | null

  constructor() {
    this.all_search = []
    this.loading = null
  }
  async init() {
    this.loading = (async () => {
      await ensure_flexsearch_loaded()
      if (db.loaded) await db.loaded
      const { Index } = window.FlexSearch
      const variables = ['name', 'description']
      for (const variable of variables) {
        const entities_data = []
        for (const entity in entity_names) {
          entities_data.push({
            name: entity,
            items: new Index({ tokenize: 'forward' }),
            data: [],
          })
        }
        this.all_search.push({ name: variable, entities: entities_data })
      }
      for (const variable of this.all_search) {
        for (const entity of variable.entities) {
          db.foreach(entity.name, item => {
            let name = item[variable.name]
            if (item.original_name && variable.name === 'name')
              name += ` (${item.original_name})`
            entity.items.add(item.id, removeDiacritics(name))
          })
        }
      }
    })()
  }
  async search(to_search) {
    if (this.loading) await this.loading
    const result = []
    const ids_found = {}
    for (const entity in entity_names) ids_found[entity] = []
    for (const variable of this.all_search) {
      for (const entity of variable.entities) {
        const items_id = await this.get_items_id(to_search, entity, ids_found)
        for (const item_id of items_id) {
          const item = db.get(entity.name, item_id)
          result.push({
            id: item.id,
            name:
              item.name +
              (item.original_name ? ` (${item.original_name})` : ''),
            description: item.description,
            entity: entity.name,
            variable: variable.name,
            is_favorite: item.is_favorite,
            folder_id: item.folder_id,
            folder_name: item.folder_name,
            _entity: item._entity,
            _entity_clean: entity_names[item._entity as string],
          })
        }
      }
    }
    return result
  }
  async get_items_id(to_search, entity, ids_found) {
    entity.data = []
    const normalizedSearch = removeDiacritics(to_search)
    if (!normalizedSearch) return []
    const result = await entity.items.search(normalizedSearch, { limit: 99999 })
    const items_id = result.filter(x => !ids_found[entity.name].includes(x))
    ids_found[entity.name] = ids_found[entity.name].concat(items_id)
    return items_id
  }
}
