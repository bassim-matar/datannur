import { page_content_loaded } from "@js/store"

export default class Datatables_timer {
  static nb_loading = 0
  static start_time
  static start() {
    this.nb_loading += 1
    this.start_time = performance.now()
  }
  static end() {
    this.nb_loading -= 1
    if (this.nb_loading === 0) {
      const duration = performance.now() - this.start_time
      console.log("loaded all tabs in", Math.round(duration) + " ms")
      page_content_loaded.update(value => true)
    }
  }
}
