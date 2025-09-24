import jQuery from 'jquery'

const max_height = 200
const delay_before_open = 200
const open_duration = 300
const close_duration = 600

export const extendable = {
  open() {
    const elem = jQuery(this)
    elem.stop()
    this.mouse_enter_timeout = setTimeout(() => {
      elem.addClass('open').removeClass('open_full')
      elem.stop().animate({ maxHeight: max_height }, open_duration, () => {
        elem.addClass('open_full')
      })
    }, delay_before_open)
  },
  close(elem_ref, min_height = 25) {
    clearTimeout(elem_ref.mouse_enter_timeout)
    const elem = jQuery(elem_ref)
    if (!elem.hasClass('open')) return false
    const elem_height = elem.height()
    const duration = (elem_height / max_height) * close_duration
    elem.removeClass('open_full')
    elem.css({ maxHeight: elem_height + 'px' })
    elem.stop().animate({ maxHeight: min_height }, duration, () => {
      elem.removeClass('open')
    })
  },
  closeOneLine() {
    return extendable.close(this, 25)
  },
  closeTwoLines() {
    return extendable.close(this, 50)
  },
}
