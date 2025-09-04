import { writable } from "svelte/store"

const color_scheme_dark = "(prefers-color-scheme: dark)"
const is_system_dark = window.matchMedia(color_scheme_dark).matches
const default_theme = is_system_dark ? "dark" : "light"
export const dark_mode_theme = writable(default_theme)

export class Dark_mode {
  static Options: any

  static init(Options) {
    this.Options = Options
    this.Options.loaded.then(() => {
      let theme = "light"
      if (default_theme === "dark") {
        document.documentElement.classList.add("dark_mode")
        theme = "dark"
      }
      if (this.Options.get("dark_mode") === "dark") {
        document.documentElement.classList.add("dark_mode")
        theme = "dark"
      } else if (this.Options.get("dark_mode") === "light"){
        document.documentElement.classList.remove("dark_mode")
        theme = "light"
      }
      dark_mode_theme.update(current_theme => theme)
    })
  }

  static toggle() {
    document.documentElement.classList.toggle("dark_mode")
    dark_mode_theme.update(theme => {
      const new_theme = theme === "dark" ? "light" : "dark"
      this.Options.set("dark_mode", new_theme)
      return new_theme
    })
  }
}
