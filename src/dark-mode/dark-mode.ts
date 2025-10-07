import { writable } from 'svelte/store'
import Options from '@lib/options'

const colorSchemeDark = '(prefers-color-scheme: dark)'
const isSystemDark = window.matchMedia(colorSchemeDark).matches
const defaultTheme = isSystemDark ? 'dark' : 'light'
export const darkModeTheme = writable(defaultTheme)

export class DarkMode {
  static init() {
    Options.loaded.then(() => {
      let theme = 'light'
      if (defaultTheme === 'dark') {
        document.documentElement.classList.add('dark-mode')
        theme = 'dark'
      }
      if (Options.get('darkMode') === 'dark') {
        document.documentElement.classList.add('dark-mode')
        theme = 'dark'
      } else if (Options.get('darkMode') === 'light') {
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
      Options.set('darkMode', newTheme)
      return newTheme
    })
  }
}
