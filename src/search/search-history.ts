import db from '@db'
import { entityNames } from '@lib/constant'

export default class SearchHistory {
  static limit = 100
  static searchHistory = []
  static dbKey = 'user_data/search_history'
  static onChangeCallbacks: Record<string, () => void> = {}
  static onClearCallback = null

  static init(searchHistory, option) {
    this.limit = option.limit || 100
    this.searchHistory = searchHistory || []
  }
  static getAll() {
    return this.searchHistory
  }
  static add(entity, entityId) {
    let searchEntityId = 1
    this.searchHistory = this.searchHistory
      .filter(
        searchItem =>
          searchItem.entity !== entity || searchItem.entity_id !== entityId,
      )
      .map(searchItem => {
        searchItem.id = searchEntityId
        searchEntityId += 1
        return searchItem
      })

    this.searchHistory.unshift({
      id: 0,
      entity,
      entity_id: entityId,
      timestamp: Date.now(),
    })
    if (this.searchHistory.length > this.limit) {
      this.searchHistory.pop()
    }
    this.save()
    this.callOnChange()
  }
  static callOnChange() {
    Object.values(this.onChangeCallbacks).forEach(callback => callback())
  }
  static save() {
    db.browser.set(this.dbKey, this.searchHistory)
  }
  static remove(entity, entityId) {
    this.searchHistory = this.searchHistory.filter(
      searchItem =>
        searchItem.entity !== entity || searchItem.entity_id !== entityId,
    )
    this.save()
    this.callOnChange()
  }
  static clear() {
    this.searchHistory = []
    this.save()
    if (this.onClearCallback) this.onClearCallback()
  }
  static onClear(callback) {
    this.onClearCallback = callback
  }
  static getRecentSearch() {
    const result = []
    const recentSearch = this.getAll()
    for (const entry of recentSearch) {
      if (!db.exists(entry.entity, entry.entity_id)) continue
      const itemData = db.get(entry.entity, entry.entity_id)
      result.push({
        id: itemData.id,
        name: itemData.name,
        description: itemData.description,
        entity: entry.entity,
        isRecent: true,
        isFavorite: itemData.isFavorite,
        folder_id: itemData.folder_id,
        folderName: itemData.folderName,
        _entity: itemData._entity,
        _entityClean: entityNames[itemData._entity as string],
      })
    }
    return result
  }
  static getRecentSearchIds() {
    const recentSearchIds = {}
    const recentSearch = this.getAll()
    for (const [i, entry] of recentSearch.entries()) {
      if (!db.exists(entry.entity, entry.entity_id)) continue
      recentSearchIds[`${entry.entity}-${entry.entity_id}`] = i
    }
    return recentSearchIds
  }
  static putRecentFirst(result) {
    const recentIds = this.getRecentSearchIds()
    const recentSearch = { name: [], description: [] }
    for (const item of result) {
      const key = `${item.entity}-${item.id}`
      if (!(key in recentIds)) continue
      const itemData = { ...item, isRecent: true, position: recentIds[key] }
      for (const [variable, list] of Object.entries(recentSearch)) {
        if (item.variable === variable) list.push(itemData)
      }
    }
    recentSearch.name.sort((a, b) => a.position - b.position)
    recentSearch.description.sort((a, b) => a.position - b.position)
    result = result.filter(item => !(`${item.entity}-${item.id}` in recentIds))
    return [...recentSearch.name, ...recentSearch.description, ...result]
  }
  static onChange(key: string, callback: () => void) {
    if (this.onChangeCallbacks === undefined) this.onChangeCallbacks = {}
    this.onChangeCallbacks[key] = callback
  }
}
