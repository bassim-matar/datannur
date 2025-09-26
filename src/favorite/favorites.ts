import db from '@db'
import Logs from '@lib/logs'
import { nbFavorite } from '@lib/store'

export default class Favorites {
  static dbKey = 'user_data/favorite'
  static favorites = []

  static init(favorites) {
    this.favorites = []
    let countNbFavorite = 0
    if (favorites) {
      this.favorites = favorites
      for (const fav of favorites) {
        if (!db.tableHasId(fav.entity, fav.entity_id)) continue
        const item = db.get(fav.entity, fav.entity_id)
        item.isFavorite = true
        item.favorite_timestamp = fav.timestamp
        countNbFavorite += 1
      }
      db.foreach('evolution', evo => {
        if (!db.tableHasId(evo.entity, evo.entity_id)) return
        const item = db.get(evo.entity, evo.entity_id)
        if (item && 'isFavorite' in item && item.isFavorite)
          evo.isFavorite = true
      })
    }
    nbFavorite.set(countNbFavorite)
  }
  static clear() {
    this.favorites = []
    this.save()
    nbFavorite.set(0)
  }
  static save() {
    db.browser.set(this.dbKey, this.favorites)
  }
  static add(entity, entityId) {
    const id = entity + '/' + entityId
    const timestamp = Date.now()
    this.favorites.push({ id, entity, entity_id: entityId, timestamp })
    this.save()
    const item = db.get(entity, entityId)
    item.isFavorite = true
    item.favorite_timestamp = timestamp
    Logs.add('add_fav', { entity, entity_id: entityId })
    nbFavorite.update(n => n + 1)
  }
  static remove(entity, entityId) {
    const id = entity + '/' + entityId
    this.favorites = this.favorites.filter(fav => fav.id !== id)
    this.save()
    const item = db.get(entity, entityId)
    item.isFavorite = false
    Logs.add('remove_fav', { entity, entity_id: entityId })
    nbFavorite.update(n => n - 1)
  }
}
