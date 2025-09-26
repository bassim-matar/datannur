import db from '@db'
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
      log.element = log.entity

      if (log.entity_id) {
        if (!db.tableHasId(log.entity, log.entity_id)) continue
        const item = db.get(log.entity, log.entity_id)
        if (item) {
          log.element = item.name
          log.elementLink = log.entity + '/' + log.entity_id
        }
      } else if (log.entity === 'log') {
        log.elementLink = 'options?tab=logs'
      } else if (log.entity === '_index') {
        log.entity = 'homepage'
        log.element = log.entity
        log.elementLink = '/'
      } else if (log.action === 'load_page') {
        log.elementLink = log.entity
      }

      const actionConfig = {
        search_bar: { text: 'Rechercher', icon: 'search' },
        load_page: { text: 'Charger la page', icon: 'page' },
        add_fav: { text: 'Ajouter le favoris', icon: 'favorite' },
        remove_fav: { text: 'Supprimer le favoris', icon: 'favorite' },
        select_tab: { text: "Sélectionner l'onglet", icon: 'tab' },
        toggle_dark_mode_btn_on: {
          text: 'Activer le mode sombre',
          icon: 'moon',
        },
        toggle_dark_mode_btn_off: {
          text: 'Activer le mode clair',
          icon: 'sun',
        },
        open_table_download: {
          text: 'Ouvrir les options de téléchargement',
          icon: 'download',
        },
        close_table_download: {
          text: 'Fermer les options de téléchargement',
          icon: 'downloadClose',
        },
      }

      if (log.action in actionConfig) {
        const config = actionConfig[log.action]
        log.actionReadable = config.text
        log.actionIcon = config.icon
        log.action = Render.icon(config.icon) + config.text
      }
      let iconName = log.entity
      if (!(iconName in entityToIcon) && iconName in this.allTabsIconValue)
        iconName = this.allTabsIconValue[iconName].icon

      if (iconName) log.elementIcon = iconName
      logs.push(log)
    }
    return logs
  }
}
