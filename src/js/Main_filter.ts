import db from "@db"

export default class Main_filter {
  static db_key
  static filters

  static init() {
    return new Promise<void>(resolve => {
      this.db_key = "user_data/filter_active"
      this.filters = []
      db.browser.get(this.db_key).then(filters => {
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
  static get_type_to_filter() {
    return this.filters
      .filter(({ is_active }) => !is_active)
      .map(({ id }) => id)
  }
  static save(filters) {
    db.browser.set(
      this.db_key,
      filters.map(({ id, is_active }) => ({ id, is_active }))
    )
  }
}
