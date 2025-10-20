import {
  pageContentLoaded,
  pageLoadedRoute,
} from '@spa-core/router/router-store'

export default class DatatablesTimer {
  static nbLoading = 0
  static startTime: number
  static start() {
    this.nbLoading += 1
    this.startTime = performance.now()
  }
  static end() {
    this.nbLoading -= 1
    if (this.nbLoading === 0) {
      const duration = performance.now() - this.startTime
      console.log('loaded all tabs in', Math.round(duration) + ' ms')
      pageContentLoaded.set(true)

      let route = ''
      if (window.location.hash) {
        route = window.location.hash.split('#/')[1].split('?')[0]
      } else {
        route = window.location.pathname.substring(1)
      }
      pageLoadedRoute.set(route.replace(/\//g, '___'))
    }
  }
}
