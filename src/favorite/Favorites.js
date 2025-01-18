import db from "@db"
import Logs from "@js/Logs"
import { nb_favorite } from "@js/store"

export default class Favorites {
  static db_key = "user_data/favorite"
  static init(favorites) {
    this.favorites = []
    let count_nb_favorite = 0
    if (favorites) {
      this.favorites = favorites
      for (const fav of favorites) {
        if (!db.table_has_id(fav.entity, fav.entity_id)) continue
        const item = db.get(fav.entity, fav.entity_id)
        item.is_favorite = true
        item.favorite_timestamp = fav.timestamp
        count_nb_favorite += 1
      }
      db.foreach("evolution", evo => {
        if (!db.table_has_id(evo.entity, evo.entity_id)) return
        const item = db.get(evo.entity, evo.entity_id)
        if (item && item.is_favorite) evo.is_favorite = true
      })
    }
    nb_favorite.update(n => count_nb_favorite)
  }
  static clear() {
    this.favorites = []
    this.save()
    nb_favorite.update(n => 0)
  }
  static save() {
    db.browser.set(this.db_key, this.favorites)
  }
  static add(entity, entity_id) {
    const id = entity + "/" + entity_id
    const timestamp = Date.now()
    this.favorites.push({ id, entity, entity_id, timestamp })
    this.save()
    const item = db.get(entity, entity_id)
    item.is_favorite = true
    item.favorite_timestamp = timestamp
    Logs.add("add_fav", { entity, entity_id })
    nb_favorite.update(n => n + 1)
  }
  static remove(entity, entity_id) {
    const id = entity + "/" + entity_id
    this.favorites = this.favorites.filter(fav => fav.id !== id)
    this.save()
    const item = db.get(entity, entity_id)
    item.is_favorite = false
    Logs.add("remove_fav", { entity, entity_id })
    nb_favorite.update(n => n - 1)
  }
}
