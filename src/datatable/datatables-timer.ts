import { pageContentLoaded } from '@lib/store'

export default class DatatablesTimer {
  static nbLoading = 0
  static startTime
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
    }
  }
}
