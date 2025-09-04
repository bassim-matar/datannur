import { app_mode } from "@lib/util"

export class url_hash {
  static default = "homepage"
  static get_all() {
    let hash = window.location.hash
    if (app_mode === "static_render")
      hash = window.location.pathname.substring(1)
    if (hash.includes("#/")) hash = hash?.split("#/")[1]
    hash = hash?.split("?")[0]
    if (!hash || hash === "") return this.default
    return hash
  }
  static get_level_1() {
    let hash = this.get_all()
    return hash.split("/")[0]
  }
  static get_level_2() {
    let hash = this.get_all()
    if (hash.split("/").length < 2) return ""
    return hash.split("/")[1]
  }
}
