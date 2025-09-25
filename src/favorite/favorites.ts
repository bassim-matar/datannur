import db from '@db'
import Logs from '@lib/logs'
import { nbFavorite } from '@lib/store'

export default class Favorites {
  static db_key = 'user_data/favorite'
  static favorites = []

  static init(favorites) {
    this.favorites = []
    let count_nb_favorite = 0
    if (favorites) {
      this.favorites = favorites
      for (const fav of favorites) {
        if (!db.tableHasId(fav.entity, fav.entity_id)) continue
        const item = db.get(fav.entity, fav.entity_id)
        item.is_favorite = true
        item.favorite_timestamp = fav.timestamp
        count_nb_favorite += 1
      }
      db.foreach('evolution', evo => {
        if (!db.tableHasId(evo.entity, evo.entity_id)) return
        const item = db.get(evo.entity, evo.entity_id)
        if (item && 'is_favorite' in item && item.is_favorite)
          evo.is_favorite = true
      })
    }
    nbFavorite.set(count_nb_favorite)
  }
  static clear() {
    this.favorites = []
    this.save()
    nbFavorite.set(0)
  }
  static save() {
    db.browser.set(this.db_key, this.favorites)
  }
  static add(entity, entity_id) {
    const id = entity + '/' + entity_id
    const timestamp = Date.now()
    this.favorites.push({ id, entity, entity_id, timestamp })
    this.save()
    const item = db.get(entity, entity_id)
    item.is_favorite = true
    item.favorite_timestamp = timestamp
    Logs.add('add_fav', { entity, entity_id })
    nbFavorite.update(n => n + 1)
  }
  static remove(entity, entity_id) {
    const id = entity + '/' + entity_id
    this.favorites = this.favorites.filter(fav => fav.id !== id)
    this.save()
    const item = db.get(entity, entity_id)
    item.is_favorite = false
    Logs.add('remove_fav', { entity, entity_id })
    nbFavorite.update(n => n - 1)
  }
}
