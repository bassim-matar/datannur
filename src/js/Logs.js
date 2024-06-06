import db from "@db"
import { link } from "@js/util"
import Render from "@js/Render"
import { all_tabs_icon } from "@js/store"

export default class Logs {
  static db_key = "user_data/log"
  static init(logs) {
    this.logs = []
    if (logs) this.logs = logs
    this.on_change_callback = () => {}
    this.all_tabs_icon_value = {}
    all_tabs_icon.subscribe(value => {
      this.all_tabs_icon_value = value
    })
  }
  static save() {
    db.browser.set(this.db_key, this.logs)
    this.on_change_callback()
  }
  static on_change(callback) {
    this.on_change_callback = callback
  }
  static off_change() {
    this.on_change_callback = () => {}
  }
  static clear() {
    this.logs = []
    this.save()
  }
  static add(action, log) {
    this.logs.unshift({
      id: this.logs.length + 1,
      action,
      entity: log?.entity || "",
      entity_id: log?.entity_id || "",
      timestamp: Date.now(),
    })
    this.save()
  }
  static get_all() {
    const logs = []
    for (const log_source of this.logs) {
      const log = { ...log_source }

      log.action_name = log.action

      if (log.entity_id) {
        if (!db.table_has_id(log.entity, log.entity_id)) continue
        const item = db.get(log.entity, log.entity_id)
        if (item) {
          log.element = link(log.entity + "/" + log.entity_id, item.name)
        }
      } else if (log.entity === "log") {
        log.element = link("options?tab=logs", log.entity)
      } else if (log.entity === "_index") {
        log.entity = "homepage"
        log.element = link("", log.entity)
      } else if (log.action === "load_page") {
        log.element = link(log.entity, log.entity)
      } else {
        log.element = log.entity
      }

      const readeable_action = {
        search_bar: Render.icon("search") + "Rechercher",
        load_page: Render.icon("page") + "Charger la page",
        add_fav: Render.icon("favorite") + "Ajouter le favoris",
        remove_fav: Render.icon("favorite") + "Supprimer le favoris",
        select_tab: Render.icon("tab") + "Sélectionner l'onglet",
        toggle_dark_mode_btn_on: Render.icon("moon") + "Activer le mode sombre",
        toggle_dark_mode_btn_off:
          Render.icon("sun") + "Activer le mode clair",
        open_table_download:
          Render.icon("download") + "Ouvrir les options de téléchargement",
        close_table_download:
          Render.icon("download_close") +
          "Fermer les options de téléchargement",
      }
      if (log.action in readeable_action) {
        log.action = readeable_action[log.action]
      }
      let icon_name = log.entity
      if (icon_name in this.all_tabs_icon_value)
        icon_name = this.all_tabs_icon_value[icon_name].icon
      if (icon_name) log.element = Render.icon(icon_name) + log.element
      logs.push(log)
    }
    return logs
  }
}
