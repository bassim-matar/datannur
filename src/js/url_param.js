import { app_mode } from "@js/util"

export class url_param {
  static get(key) {
    let hash = window.location.hash
    if (app_mode === "static_render") hash = window.location.search
    if (!hash.includes("?")) return false
    const params_string = hash.split("?")[1]
    if (!params_string) return false
    const urlParams = new URLSearchParams(params_string)
    return urlParams.get(key)
  }
  static set(key, value) {
    this.edit(key, value, "set")
  }
  static delete(key) {
    this.edit(key, null, "delete")
  }
  static reset() {
    const loc = window.location
    let hash = loc.hash.split("?")[0]
    if (hash === "") {
      hash = "#!/"
      if (app_mode === "static_render") hash = ""
    }
    const url = loc.protocol + "//" + loc.host + loc.pathname + hash
    window.history.replaceState(null, null, url)
  }
  static edit(key, value, mode) {
    const loc = window.location
    let hash
    if (app_mode === "static_render") {
      hash = ""
    } else {
      hash = loc.hash.split("?")[0]
      if (hash === "") hash = "#!/"
    }
    const url = loc.protocol + "//" + loc.host + loc.pathname + hash
    const params_string = loc.href.split("?")[1]
    const params = new URLSearchParams(params_string)
    if (mode === "set") {
      params.set(key, value)
    } else if (mode === "delete") {
      params.delete(key)
    }
    let url_with_params = url
    if (params.toString() !== "") {
      url_with_params += "?" + params.toString()
    }
    window.history.replaceState(null, null, url_with_params)
  }
  static get_all_params() {
    let hash = window.location.hash
    if (app_mode === "static_render") hash = window.location.href
    if (!hash.includes("?")) return {}
    const params_string = hash.split("?")[1]
    const url_params = new URLSearchParams(params_string)
    let params_obj = {}
    url_params.forEach((value, key) => {
      params_obj[key] = value
    })
    return params_obj
  }
}
