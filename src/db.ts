import Jsonjsdb from 'jsonjsdb'
import type {
  Evolution,
  Dataset,
  Variable,
  Modality,
  Value,
  Freq,
  Folder,
  Institution,
  Tag,
  Doc,
  Config,
  MetaVariable,
  MetaDataset,
  MetaFolder,
  Favorite,
  FilterActive,
  Log,
  Option,
  SearchHistory,
  EntityTypeMap,
  EntityName,
  Row,
} from '@type'

interface Schema {
  one_to_one: [string, string][]
  one_to_many: string[][]
  many_to_many: [string, string][]
  aliases: string[]
  alone?: string[]
}

interface SearchResult {
  id: string | number
  name: string
  description: string
  entity: string
  variable: string
  isFavorite: boolean
  folder_id: string | number
  folder_name: string
  _entity: string
  _entityClean: string
}

type ExtendedJsonjsdb = Omit<
  Jsonjsdb,
  'get' | 'getAll' | 'foreach' | 'addMeta'
> & {
  db: Row
  loaded: Promise<void>
  preview: Row
  search: (searchTerm: string) => Promise<SearchResult[]>
  foreach<K extends EntityName>(
    table: K,
    callback: (row: EntityTypeMap[K]) => void,
  ): void
  get<K extends keyof EntityTypeMap>(
    entity: K,
    id: string | number,
  ): EntityTypeMap[K] | undefined
  getAll<K extends EntityName>(entity: K, filter?: Row): EntityTypeMap[K][]
  addMeta(userData?: Row, dbSchema?: string[][]): void
  tables: {
    __schema__?: Schema
    config?: Config[]
    dataset?: Dataset[]
    variable?: Variable[]
    modality?: Modality[]
    value?: Value[]
    freq?: Freq[]
    folder?: Folder[]
    institution?: Institution[]
    tag?: Tag[]
    doc?: Doc[]
    evolution?: Evolution[]
    metaVariable?: MetaVariable[]
    metaDataset?: MetaDataset[]
    metaFolder?: MetaFolder[]
    favorite?: Favorite[]
    filter_active?: FilterActive[]
    log?: Log[]
    option?: Option[]
    search_history?: SearchHistory[]
    [key: string]: unknown[] | Schema | undefined
  }
  use: {
    institution?: boolean
    folder?: boolean
    tag?: boolean
    doc?: boolean
    dataset?: boolean
    variable?: boolean
    modality?: boolean
    filter?: boolean
    owner?: boolean
    manager?: boolean
    tag_recursive?: boolean
    about?: boolean
  }
}

const db = new Jsonjsdb('#jsonjsdb-config') as unknown as ExtendedJsonjsdb

export default db
