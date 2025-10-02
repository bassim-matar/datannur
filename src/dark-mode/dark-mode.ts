import { writable } from 'svelte/store'

const colorSchemeDark = '(prefers-color-scheme: dark)'
const isSystemDark = window.matchMedia(colorSchemeDark).matches
const defaultTheme = isSystemDark ? 'dark' : 'light'
export const darkModeTheme = writable(defaultTheme)

export class DarkMode {
  static options

  static init(options) {
    this.options = options
    this.options.loaded.then(() => {
      let theme = 'light'
      if (defaultTheme === 'dark') {
        document.documentElement.classList.add('dark-mode')
        theme = 'dark'
      }
      if (this.options.get('darkMode') === 'dark') {
        document.documentElement.classList.add('dark-mode')
        theme = 'dark'
      } else if (this.options.get('darkMode') === 'light') {
        document.documentElement.classList.remove('dark-mode')
        theme = 'light'
      }
      darkModeTheme.set(theme)
    })
  }

  static toggle() {
    document.documentElement.classList.toggle('dark-mode')
    darkModeTheme.update(theme => {
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      this.options.set('darkMode', newTheme)
      return newTheme
    })
  }
}
