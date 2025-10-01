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

      log.actionName = log.action
      log.element = log.entity

      if (log.entity_id) {
        if (!db.exists(log.entity, log.entity_id)) continue
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

      const actionConfig = new Map([
        ['search_bar', ['Rechercher', 'search']],
        ['load_page', ['Charger la page', 'page']],
        ['add_fav', ['Ajouter le favoris', 'favorite']],
        ['remove_fav', ['Supprimer le favoris', 'favorite']],
        ['select_tab', ["Sélectionner l'onglet", 'tab']],
        ['toggle_dark_mode_btn_on', ['Activer le mode sombre', 'moon']],
        ['toggle_dark_mode_btn_off', ['Activer le mode clair', 'sun']],
        [
          'open_table_download',
          ['Ouvrir les options de téléchargement', 'download'],
        ],
        [
          'close_table_download',
          ['Fermer les options de téléchargement', 'downloadClose'],
        ],
      ])

      const config = actionConfig.get(log.action)
      if (config) {
        const [text, icon] = config
        log.actionReadable = text
        log.actionIcon = icon
        log.action = Render.icon(icon) + text
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
