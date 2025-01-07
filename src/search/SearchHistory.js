import db from "@db"
import { entity_names } from "@js/constant"

export default class SearchHistory {
  static db_key = "user_data/search_history"
  static init(search_history, option) {
    this.limit = option.limit || 100
    this.search_history = search_history || []
  }
  static get_all() {
    return this.search_history
  }
  static add(entity, entity_id) {
    let search_entity_id = 1
    this.search_history = this.search_history
      .filter(
        search_item =>
          search_item.entity !== entity ||
          search_item.entity_id !== entity_id
      )
      .map(search_item => {
        search_item.id = search_entity_id
        search_entity_id += 1
        return search_item
      })

    this.search_history.unshift({
      id: 0,
      entity,
      entity_id,
      timestamp: Date.now(),
    })
    if (this.search_history.length > this.limit) {
      this.search_history.pop()
    }
    this.save()
    this.call_on_change()
  }
  static call_on_change() {
    for (const [key, callback] of Object.entries(this.on_change_callbacks)) {
      callback()
    }
  }
  static save() {
    db.browser.set(this.db_key, this.search_history)
  }
  static remove(entity, entity_id) {
    this.search_history = this.search_history.filter(
      search_item =>
        search_item.entity !== entity ||
        search_item.entity_id !== entity_id
    )
    this.save()
    this.call_on_change()
  }
  static clear() {
    this.search_history = []
    this.save()
    if (this.on_clear_callback) this.on_clear_callback()
  }
  static on_clear(callback) {
    this.on_clear_callback = callback
  }
  static get_recent_search() {
    const result = []
    const recent_search = this.get_all()
    for (const entry of recent_search) {
      if (!db.table_has_id(entry.entity, entry.entity_id)) continue
      const item_data = db.get(entry.entity, entry.entity_id)
      result.push({
        id: item_data.id,
        name: item_data.name,
        description: item_data.description,
        entity: entry.entity,
        is_recent: true,
        is_favorite: item_data.is_favorite,
        folder_id: item_data.folder_id,
        folder_name: item_data.folder_name,
        _entity: item_data._entity,
        _entity_clean: entity_names[item_data._entity],
      })
    }
    return result
  }
  static get_recent_search_ids() {
    const recent_search_ids = {}
    const recent_search = this.get_all()
    for (const [i, entry] of recent_search.entries()) {
      if (!db.table_has_id(entry.entity, entry.entity_id)) continue
      recent_search_ids[`${entry.entity}-${entry.entity_id}`] = i
    }
    return recent_search_ids
  }
  static put_recent_first(result) {
    const recent_ids = this.get_recent_search_ids()
    const recent_search = { name: [], description: [] }
    for (const item of result) {
      const key = `${item.entity}-${item.id}`
      if (!(key in recent_ids)) continue
      const item_data = { ...item, is_recent: true, position: recent_ids[key] }
      for (const [variable, list] of Object.entries(recent_search)) {
        if (item.variable === variable) list.push(item_data)
      }
    }
    recent_search.name.sort((a, b) => a.position - b.position)
    recent_search.description.sort((a, b) => a.position - b.position)
    result = result.filter(item => !(`${item.entity}-${item.id}` in recent_ids))
    return [...recent_search.name, ...recent_search.description, ...result]
  }
  static on_change(key, callback) {
    if (this.on_change_callbacks === undefined) this.on_change_callbacks = {}
    this.on_change_callbacks[key] = callback
  }
}
