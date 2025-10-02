import jQuery from 'jquery'

const maxHeight = 200
const delayBeforeOpen = 200
const openDuration = 300
const closeDuration = 600

export const extendable = {
  mouseEnterTimeout: null,
  open() {
    const elem = jQuery(this)
    elem.stop()
    this.mouseEnterTimeout = setTimeout(() => {
      elem.addClass('open').removeClass('open-full')
      elem.stop().animate({ maxHeight: maxHeight }, openDuration, () => {
        elem.addClass('open-full')
      })
    }, delayBeforeOpen)
  },
  close(elemRef, minHeight = 25) {
    clearTimeout(elemRef.mouseEnterTimeout)
    const elem = jQuery(elemRef)
    if (!elem.hasClass('open')) return false
    const elemHeight = elem.height()
    const duration = (elemHeight / maxHeight) * closeDuration
    elem.removeClass('open-full')
    elem.css({ maxHeight: elemHeight + 'px' })
    elem.stop().animate({ maxHeight: minHeight }, duration, () => {
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
