export default class DatatablesLoading {
  static nbLoading = 0
  static finished = false
  static start() {
    this.nbLoading += 1
  }
  static end() {
    this.nbLoading -= 1
    if (this.nbLoading === 0) {
      this.finished = true
    }
  }
}
