import db from '@db'

export default class MainFilter {
  static dbKey
  static filters

  static init() {
    return new Promise<void>(resolve => {
      this.dbKey = 'user_data/filter_active'
      this.filters = []
      db.browser.get(this.dbKey).then(filters => {
        if (filters) {
          this.filters = filters
        }
        resolve()
      })
    })
  }
  static get() {
    return this.filters
  }
  static getTypeToFilter() {
    return this.filters.filter(row => !row.is_active).map(row => row.id)
  }
  static save(filters) {
    db.browser.set(
      this.dbKey,
      filters.map(row => ({ id: row.id, is_active: row.is_active })),
    )
  }
}
