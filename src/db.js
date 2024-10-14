/// <reference path="../node_modules/jsonjsdb/jsonjsdb.d.ts" />
import Jsonjsdb from "jsonjsdb"

/**
 * @type {Jsonjsdb}
 */
const db = new Jsonjsdb("#jsonjsdb_config")

export default db
