import db from '@db'

type Option = { id: string; value: unknown }

export default class Options {
  static loaded: Promise<void>
  static dbKey: string
  static options: Option[]

  static init() {
    return new Promise<void>(resolve => {
      this.dbKey = 'user_data/option'
      this.options = []
      db.browser.get(this.dbKey).then(options => {
        if (options) {
          this.options = options as Option[]
        }
        resolve()
      })
    })
  }
  static getOption(id) {
    return this.options.find(element => element.id === id)
  }
  static get(id) {
    return this.getOption(id)?.value
  }
  static set(id, value, callback = () => {}) {
    const option = this.getOption(id)
    if (option) option.value = value
    else this.options.push({ id, value })
    this.save(callback)
  }
  static save(callback = () => {}) {
    db.browser.set(this.dbKey, this.options, callback)
  }
}
