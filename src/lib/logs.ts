import db from '@db'
import Render from '@lib/render'
import { allTabsIcon } from '@lib/store'
import { entityToIcon } from '@lib/constant'
import type { Log, EntityName } from '@type'

export default class Logs {
  static dbKey = 'userData/log'
  static logs: Log[] = []
  static onChangeCallback = () => {}
  static allTabsIconValue: Record<string, { icon: string }> = {}

  static init(logs: Log[] | null) {
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
  static onChange(callback: () => void) {
    this.onChangeCallback = callback
  }
  static offChange() {
    this.onChangeCallback = () => {}
  }
  static clear() {
    this.logs = []
    this.save()
  }
  static add(
    action: string,
    log: {
      entity?: EntityName | string
      entityId?: string | number
    } | null = null,
  ) {
    this.logs.unshift({
      id: this.logs.length + 1,
      action,
      entity: log?.entity ?? '',
      entityId: log?.entityId ?? '',
      timestamp: Date.now(),
    })
    this.save()
  }
  static getAll() {
    const logs: Log[] = []
    for (const logSource of this.logs) {
      const log = { ...logSource }

      log.actionName = log.action
      log.element = log.entity

      if (log.entityId) {
        if (!db.exists(log.entity as EntityName, log.entityId)) continue
        const item = db.get(log.entity as EntityName, log.entityId)
        if (item && 'name' in item) {
          log.element = item.name
          log.elementLink = log.entity + '/' + log.entityId
        }
      } else if (log.entity === 'log') {
        log.elementLink = 'options?tab=logs'
      } else if (log.entity === '_index') {
        log.entity = 'homepage'
        log.element = log.entity
        log.elementLink = '/'
      } else if (log.action === 'loadPage') {
        log.elementLink = log.entity
      }

      const actionConfig = new Map([
        ['searchBar', ['Rechercher', 'search']],
        ['loadPage', ['Charger la page', 'page']],
        ['addFav', ['Ajouter le favoris', 'favorite']],
        ['removeFav', ['Supprimer le favoris', 'favorite']],
        ['selectTab', ["Sélectionner l'onglet", 'tab']],
        ['toggleDarkModeBtnOn', ['Activer le mode sombre', 'moon']],
        ['toggleDarkModeBtnOff', ['Activer le mode clair', 'sun']],
        [
          'openTableDownload',
          ['Ouvrir les options de téléchargement', 'download'],
        ],
        [
          'closeTableDownload',
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
