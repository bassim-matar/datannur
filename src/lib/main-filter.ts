import db from '@db'
import type { Filter } from '@type'

export default class MainFilter {
  static dbKey: string
  static filters: Filter[]

  static init() {
    return new Promise<void>(resolve => {
      this.dbKey = 'userData/filterActive'
      this.filters = []
      db.browser.get(this.dbKey).then(filters => {
        if (filters && Array.isArray(filters)) {
          this.filters = filters as Filter[]
        }
        resolve()
      })
    })
  }
  static get() {
    return this.filters
  }
  static getTypeToFilter() {
    return this.filters.filter(row => !row.isActive).map(row => row.id)
  }
  static save(filters: Filter[]) {
    db.browser.set(
      this.dbKey,
      filters.map(row => ({ id: row.id, isActive: row.isActive })),
    )
  }
}
