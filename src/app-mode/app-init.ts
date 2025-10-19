import db from '@db'
import Options from '@lib/options'
import MainFilter from '@lib/main-filter'
import { loadUserData } from '@lib/user-data'
import { dbAddProcessedData } from '@lib/db'
import search from '@search/search'
import Logs from '@lib/logs'
import Favorites from '@favorite/favorites'
import SearchHistory from '@search/search-history'
import dbSchema from '@src/assets/db-schema.json'
import type { SearchHistoryEntry } from '@search/search-history'
import type { Favorite } from '@favorite/favorites'
import type { Log } from '@src/type'

let initPromise: Promise<void> | null = null

export function initApp(): Promise<void> {
  if (initPromise) {
    return initPromise
  }

  const timer = performance.now()

  initPromise = (async () => {
    try {
      let stepTimer = performance.now()
      await Options.init()
      console.log(
        'init option',
        Math.round(performance.now() - stepTimer) + ' ms',
      )

      stepTimer = performance.now()
      await MainFilter.init()
      const filter = {
        entity: 'dataset',
        variable: 'type',
        values: MainFilter.getTypeToFilter(),
      }
      console.log(
        'init filter',
        Math.round(performance.now() - stepTimer) + ' ms',
      )

      stepTimer = performance.now()
      const dbOption = {
        filter,
        aliases: [
          { table: 'institution', alias: 'owner' },
          { table: 'institution', alias: 'manager' },
        ],
      }
      await db.init(dbOption)
      console.log('load db', Math.round(performance.now() - stepTimer) + ' ms')

      stepTimer = performance.now()
      const userData = await loadUserData()
      db.addMeta(userData, dbSchema as string[][])
      dbAddProcessedData()
      console.log(
        'process db',
        Math.round(performance.now() - stepTimer) + ' ms',
      )

      stepTimer = performance.now()
      await search.init()
      Logs.init(userData.log as Log[] | null)
      Favorites.init(userData.favorite as Favorite[])
      SearchHistory.init(userData.searchHistory as SearchHistoryEntry[], {
        limit: 100,
      })

      console.log('init total', Math.round(performance.now() - timer) + ' ms')
    } catch (error) {
      console.error('App initialization failed:', error)
      throw error
    }
  })()

  return initPromise
}
