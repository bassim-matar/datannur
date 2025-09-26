export class UrlParam {
  static getAppMode() {
    return appMode
  }
  static get(key) {
    let hash = window.location.hash
    if (appMode === 'static_render') hash = window.location.search
    if (!hash.includes('?')) {
      hash = window.location.search
      if (!hash.includes('?')) return false
    }
    const paramsString = hash.split('?')[1]
    if (!paramsString) return false
    const urlParams = new URLSearchParams(paramsString)
    return urlParams.get(key)
  }
  static set(key, value) {
    this.edit(key, value, 'set')
  }
  static delete(key) {
    this.edit(key, null, 'delete')
  }
  static reset() {
    const loc = window.location
    let hash = loc.hash.split('?')[0]
    if (hash === '') {
      hash = '#/'
      if (appMode === 'static_render') hash = ''
    }
    const url = loc.protocol + '//' + loc.host + loc.pathname + hash
    window.history.replaceState(null, null, url)
  }
  static edit(key, value, mode) {
    const loc = window.location
    let hash
    const paramsString = loc.href.split('?')[1]
    const params = new URLSearchParams(paramsString)
    if (mode === 'set') {
      params.set(key, value)
    } else if (mode === 'delete') {
      params.delete(key)
    }
    if (appMode === 'static_render') {
      hash = ''
    } else {
      hash = loc.hash.split('?')[0]
      if (hash === '' && params.toString() !== '') {
        hash = '#/'
      }
      if (hash === '#/' && params.toString() === '') hash = ''
    }
    const url = loc.protocol + '//' + loc.host + loc.pathname + hash
    let urlWithParams = url
    if (params.toString() !== '') {
      urlWithParams += '?' + params.toString()
    }
    window.history.replaceState(null, null, urlWithParams)
  }
  static getAllParams() {
    let hash = window.location.hash
    if (appMode === 'static_render') hash = window.location.href
    if (!hash.includes('?')) return {}
    const paramsString = hash.split('?')[1]
    const urlParams = new URLSearchParams(paramsString)
    const paramsObj = {}
    urlParams.forEach((value, key) => {
      paramsObj[key] = value
    })
    return paramsObj
  }
}

let appMode = 'spa'
const urlAppMode = UrlParam.get('app_mode')

if (urlAppMode == 'check_db') {
  appMode = 'check_db'
} else if (urlAppMode == 'static_render') {
  appMode = 'static_render'
} else if (document.querySelector('meta[app-mode="static"]')) {
  appMode = 'static_render'
}
