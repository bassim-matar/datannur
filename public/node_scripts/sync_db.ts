import path, { dirname, join } from "path"
import { fileURLToPath } from "url"
import { Jsonjsdb_watcher } from "jsonjsdb_editor"

const __dirname = dirname(fileURLToPath(import.meta.url))
process.chdir(join(__dirname, ".."))

const root = "./data/"

await Jsonjsdb_watcher.set_db(root + "db")
await Jsonjsdb_watcher.watch(root + "/db_source", true)
await Jsonjsdb_watcher.update_preview("preview", root + "dataset")
