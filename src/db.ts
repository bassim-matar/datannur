import Jsonjsdb from "jsonjsdb"

interface ExtendedJsonjsdb extends Jsonjsdb {
  use: {
    institution?: boolean
    folder?: boolean
    tag?: boolean
    doc?: boolean
    dataset?: boolean
    variable?: boolean
    modality?: boolean
    filter?: boolean
    info?: boolean
    owner?: boolean
    manager?: boolean
    tag_recursive?: boolean
  }
}

const db = new Jsonjsdb("#jsonjsdb_config") as ExtendedJsonjsdb

export default db
