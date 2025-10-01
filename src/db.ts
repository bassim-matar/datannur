import Jsonjsdb from 'jsonjsdb'
import type { EntityTypeMap } from '@type'

const db = new Jsonjsdb<EntityTypeMap>('#jsonjsdb-config')

export default db
