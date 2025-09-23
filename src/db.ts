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
} from '@type'

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

type ExtendedJsonjsdb = Omit<Jsonjsdb, 'get' | 'getAll' | 'foreach'> & {
  db: Record<string, unknown>
  loaded: Promise<void>
  preview: Record<string, unknown>
  search: (searchTerm: string) => Promise<SearchResult[]>
  foreach<K extends EntityName>(
    table: K,
    callback: (row: EntityTypeMap[K]) => void,
  ): void
  get<K extends keyof EntityTypeMap>(
    entity: K,
    id: string | number,
  ): EntityTypeMap[K] | undefined
  getAll<K extends EntityName>(
    entity: K,
    filter?: Record<string, any>,
  ): EntityTypeMap[K][]
  tables: {
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
    [key: string]: any[] | undefined
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
