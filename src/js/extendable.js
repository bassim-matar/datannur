import jQuery from "jquery"

const max_height = 200
const min_height = 50
const open_duration = 500
const close_duration = 2000

export const extendable = {
  open() {
    const elem = jQuery(this)
    elem.stop()
    this.mouse_enter_timeout = setTimeout(() => {
      elem.addClass("open").removeClass("open_full")
      elem.stop().animate({ maxHeight: max_height }, open_duration, () => {
        elem.addClass("open_full")
      })
    }, 300)
  },
  close() {
    clearTimeout(this.mouse_enter_timeout)
    const elem = jQuery(this)
    if (!elem.hasClass("open")) return false
    const elem_height = elem.height()
    const duration = (elem_height / max_height) * close_duration
    elem.removeClass("open_full")
    elem.css({ maxHeight: elem_height + "px" })
    elem.stop().animate({ maxHeight: min_height }, duration, () => {
      elem.removeClass("open")
    })
  },
}
