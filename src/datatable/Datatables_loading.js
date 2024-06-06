export default class Datatables_loading {
  static nb_loading = 0
  static finished = false
  static start() {
    this.nb_loading += 1
  }
  static end() {
    this.nb_loading -= 1
    if (this.nb_loading === 0) {
      this.finished = true
    }
  }
}
