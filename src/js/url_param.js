export class url_param {
  static get_app_mode() {
    return app_mode
  }
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
    const params_string = loc.href.split("?")[1]
    const params = new URLSearchParams(params_string)
    if (mode === "set") {
      params.set(key, value)
    } else if (mode === "delete") {
      params.delete(key)
    }
    if (app_mode === "static_render") {
      hash = ""
    } else {
      hash = loc.hash.split("?")[0]
      if (hash === "" && params.toString() !== "") {
        hash = "#!/"
      }
      if (hash === "#!/" && params.toString() === "") hash = ""
    }
    const url = loc.protocol + "//" + loc.host + loc.pathname + hash
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

let app_mode = "spa"
const url_app_mode = url_param.get("app_mode")
if (url_app_mode == "check_db") {
  app_mode = "check_db"
} else if (url_app_mode == "static_render") {
  app_mode = "static_render"
}
if (document.querySelector('meta[app_mode="static"]')) {
  app_mode = "static_render"
}
