import { app_mode } from '@lib/util'

export class UrlHash {
  static default = 'homepage'
  static getAll() {
    let hash = window.location.hash
    if (app_mode === 'static_render')
      hash = window.location.pathname.substring(1)
    if (hash.includes('#/')) hash = hash?.split('#/')[1]
    hash = hash?.split('?')[0]
    if (!hash || hash === '') return this.default
    return hash
  }
  static getLevel1() {
    const hash = this.getAll()
    return hash.split('/')[0]
  }
  static getLevel2() {
    const hash = this.getAll()
    if (hash.split('/').length < 2) return ''
    return hash.split('/')[1]
  }
}
