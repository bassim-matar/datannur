import jQuery from 'jquery'

const maxHeight = 200
const delayBeforeOpen = 200
const openDuration = 300
const closeDuration = 600

interface ExtendableElement extends HTMLElement {
  mouseEnterTimeout?: ReturnType<typeof setTimeout> | null
}

export const extendable = {
  mouseEnterTimeout: null as ReturnType<typeof setTimeout> | null,
  open(this: ExtendableElement) {
    const elem = jQuery(this)
    elem.stop()
    this.mouseEnterTimeout = setTimeout(() => {
      elem.addClass('open').removeClass('open-full')
      elem.stop().animate({ maxHeight: maxHeight }, openDuration, () => {
        elem.addClass('open-full')
      })
    }, delayBeforeOpen)
  },
  close(this: ExtendableElement, minHeight = 25) {
    if (this.mouseEnterTimeout) {
      clearTimeout(this.mouseEnterTimeout)
    }
    const elem = jQuery(this)
    if (!elem.hasClass('open')) return false
    const elemHeight = elem.height()
    if (!elemHeight) return false
    const duration = (elemHeight / maxHeight) * closeDuration
    elem.removeClass('open-full')
    elem.css({ maxHeight: elemHeight + 'px' })
    elem.stop().animate({ maxHeight: minHeight }, duration, () => {
      elem.removeClass('open')
    })
  },
  closeOneLine(this: ExtendableElement) {
    return extendable.close.call(this, 25)
  },
  closeTwoLines(this: ExtendableElement) {
    return extendable.close.call(this, 50)
  },
}
