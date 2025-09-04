import Jsonjsdb from "jsonjsdb"

interface SearchResult {
  id: string | number
  name: string
  description: string
  entity: string
  variable: string
  is_favorite: boolean
  folder_id: string | number
  folder_name: string
  _entity: string
  _entity_clean: string
}

interface ExtendedJsonjsdb extends Jsonjsdb {
  db: {},
  loaded: Promise<void>,
  preview: {},
  search: (searchTerm: string) => Promise<SearchResult[]>,
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
    about?: boolean
  }
}

const db = new Jsonjsdb("#jsonjsdb_config") as ExtendedJsonjsdb

export default db
