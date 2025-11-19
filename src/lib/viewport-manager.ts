import { writable, derived } from 'svelte/store'

export const chatPanelWidth = 420

export const breakpoints = {
  smallMobile: chatPanelWidth + 360, // chat width + min app width = 780px
  mobile: 1023,
} as const

class ViewportManager {
  private _chatWidth = writable(0)
  private _windowWidth = writable(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )

  chatWidth = this._chatWidth
  appWidth = derived(
    [this._windowWidth, this._chatWidth],
    ([$windowWidth, $chatWidth]: [number, number]) => $windowWidth - $chatWidth,
  )

  isMobile = derived(
    this.appWidth,
    ($appWidth: number) => $appWidth <= breakpoints.mobile,
  )

  isDesktop = derived(
    this.appWidth,
    ($appWidth: number) => $appWidth > breakpoints.mobile,
  )

  isSmallMobile = derived(
    this.appWidth,
    ($appWidth: number) => $appWidth <= breakpoints.smallMobile,
  )

  documentWidth = this.appWidth

  constructor() {
    if (typeof window === 'undefined') return

    // Initialize immediately
    const initialWidth = window.innerWidth
    this._windowWidth.set(initialWidth)

    this.appWidth.subscribe(($appWidth: number) => {
      const chatWidthValue = this.getChatWidth()
      const windowWidthValue = this.getWindowWidth()

      document.documentElement.style.setProperty(
        '--chat-panel-width',
        `${chatPanelWidth}px`,
      )
      document.documentElement.style.setProperty(
        '--chat-width',
        `${chatWidthValue}px`,
      )
      document.documentElement.style.setProperty(
        '--app-width',
        `${$appWidth}px`,
      )

      document.body.classList.toggle(
        'small-mobile',
        windowWidthValue <= breakpoints.smallMobile,
      )
      document.body.classList.toggle('mobile', $appWidth <= breakpoints.mobile)
      document.body.classList.toggle('desktop', $appWidth > breakpoints.mobile)

      document.body.dataset.appWidth = String($appWidth)
    })

    window.addEventListener('resize', () => {
      this._windowWidth.set(window.innerWidth)
    })
  }

  setChatWidth(width: number) {
    this._chatWidth.set(width)
  }

  getChatWidth(): number {
    let width = 0
    const unsubscribe = this._chatWidth.subscribe((w: number) => (width = w))
    unsubscribe()
    return width
  }

  getAppWidth(): number {
    let width = 0
    const unsubscribe = this.appWidth.subscribe((w: number) => (width = w))
    unsubscribe()
    return width
  }

  getIsMobile(): boolean {
    let mobile = false
    const unsubscribe = this.isMobile.subscribe((m: boolean) => (mobile = m))
    unsubscribe()
    return mobile
  }

  getWindowWidth(): number {
    let width = 0
    const unsubscribe = this._windowWidth.subscribe((w: number) => (width = w))
    unsubscribe()
    return width
  }
}

export const viewportManager = new ViewportManager()
export const {
  chatWidth,
  appWidth,
  isMobile,
  isDesktop,
  isSmallMobile,
  documentWidth,
} = viewportManager
