import db from '@db'
import { link } from '@lib/util'
import Render from '@lib/render'
import { allTabsIcon } from '@lib/store'
import { entityToIcon } from '@lib/constant'

export default class Logs {
  static dbKey = 'user_data/log'
  static logs = []
  static onChangeCallback = () => {}
  static allTabsIconValue = {}

  static init(logs) {
    this.logs = []
    if (logs) this.logs = logs
    this.onChangeCallback = () => {}
    this.allTabsIconValue = {}
    allTabsIcon.subscribe(value => {
      this.allTabsIconValue = value
    })
  }
  static save() {
    db.browser.set(this.dbKey, this.logs)
    this.onChangeCallback()
  }
  static onChange(callback) {
    this.onChangeCallback = callback
  }
  static offChange() {
    this.onChangeCallback = () => {}
  }
  static clear() {
    this.logs = []
    this.save()
  }
  static add(action, log = null) {
    this.logs.unshift({
      id: this.logs.length + 1,
      action,
      entity: log?.entity || '',
      entity_id: log?.entity_id || '',
      timestamp: Date.now(),
    })
    this.save()
  }
  static getAll() {
    const logs = []
    for (const logSource of this.logs) {
      const log = { ...logSource }

      log.action_name = log.action

      if (log.entity_id) {
        if (!db.tableHasId(log.entity, log.entity_id)) continue
        const item = db.get(log.entity, log.entity_id)
        if (item) {
          log.element = link(log.entity + '/' + log.entity_id, item.name)
        }
      } else if (log.entity === 'log') {
        log.element = link('options?tab=logs', log.entity)
      } else if (log.entity === '_index') {
        log.entity = 'homepage'
        log.element = link('', log.entity)
      } else if (log.action === 'load_page') {
        log.element = link(log.entity, log.entity)
      } else {
        log.element = log.entity
      }

      const readeableAction = {
        search_bar: Render.icon('search') + 'Rechercher',
        load_page: Render.icon('page') + 'Charger la page',
        add_fav: Render.icon('favorite') + 'Ajouter le favoris',
        remove_fav: Render.icon('favorite') + 'Supprimer le favoris',
        select_tab: Render.icon('tab') + "Sélectionner l'onglet",
        toggle_dark_mode_btn_on: Render.icon('moon') + 'Activer le mode sombre',
        toggle_dark_mode_btn_off: Render.icon('sun') + 'Activer le mode clair',
        open_table_download:
          Render.icon('download') + 'Ouvrir les options de téléchargement',
        close_table_download:
          Render.icon('downloadClose') + 'Fermer les options de téléchargement',
      }
      if (log.action in readeableAction) {
        log.action = readeableAction[log.action]
      }
      let iconName = log.entity
      if (!(iconName in entityToIcon) && iconName in this.allTabsIconValue)
        iconName = this.allTabsIconValue[iconName].icon

      if (iconName) log.element = Render.icon(iconName) + log.element
      logs.push(log)
    }
    return logs
  }
}
