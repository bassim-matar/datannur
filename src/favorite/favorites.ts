import db from '@db'
import Logs from '@lib/logs'
import { nbFavorite } from '@lib/store'
import type { FavoritableEntityName } from '@type'

export type Favorite = {
  id: string
  entity: FavoritableEntityName
  entityId: string | number
  timestamp: number
}

export default class Favorites {
  static dbKey = 'userData/favorite'
  static favorites: Favorite[] = []

  static init(favorites: Favorite[] | null) {
    this.favorites = []
    let countNbFavorite = 0
    if (favorites) {
      this.favorites = favorites
      for (const fav of favorites) {
        if (!db.exists(fav.entity, fav.entityId)) continue
        const item = db.get(fav.entity, fav.entityId)
        if (!item) continue
        item.isFavorite = true
        item.favoriteTimestamp = fav.timestamp
        countNbFavorite += 1
      }
      db.foreach('evolution', evo => {
        if (!db.exists(evo.entity, evo.entityId)) return
        const item = db.get(evo.entity, evo.entityId)
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
  static add(entity: FavoritableEntityName, entityId: string | number) {
    const id = entity + '/' + entityId
    const timestamp = Date.now()
    this.favorites.push({ id, entity, entityId, timestamp })
    this.save()
    const item = db.get(entity, entityId)
    if (!item) return
    item.isFavorite = true
    item.favoriteTimestamp = timestamp
    Logs.add('addFav', { entity, entityId })
    nbFavorite.update(n => n + 1)
  }
  static remove(entity: FavoritableEntityName, entityId: string | number) {
    const id = entity + '/' + entityId
    this.favorites = this.favorites.filter(fav => fav.id !== id)
    this.save()
    const item = db.get(entity, entityId)
    if (!item) return
    item.isFavorite = false
    Logs.add('removeFav', { entity, entityId })
    nbFavorite.update(n => n - 1)
  }
}
