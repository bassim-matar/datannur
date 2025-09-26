import type {
  BaseEntity,
  Value,
  Freq,
  Config,
  Favorite,
  FilterActive,
  Log,
  Option,
  SearchHistory,
  Filter,
} from './base'

// Extended base entity with relations (defined after Tag and Doc)
export interface EntityWithRelations extends BaseEntity {
  tags?: Tag[]
  docs?: Doc[]
  docsRecursive?: (Doc & { inherited?: string })[]
}

export interface Dataset extends EntityWithRelations {
  folder_id?: string | number
  manager_id?: string | number
  owner_id?: string | number
  tag_ids?: string
  doc_ids?: string
  data_path?: string
  delivery_format?: string
  type?: string
  link?: string
  localisation?: string
  nb_row?: number
  start_date?: string
  end_date?: string
  last_update_date?: string
  updating_each?: string
  no_more_update?: boolean

  // Computed fields added during processing
  typeClean?: string
  folderName?: string
  ownerName?: string
  managerName?: string
  nbVariable?: number
  sourceIds?: Set<string | number>
  derivedIds?: Set<string | number>
  nextUpdateDate?: string
}

export interface Variable extends BaseEntity {
  dataset_id: string | number
  modality_ids?: string
  tag_ids?: string
  original_name?: string
  key?: string | boolean
  nb_distinct?: number
  nb_duplicate?: number
  nb_missing?: number
  type?: string
  start_date?: string
  end_date?: string
  sourceVar_ids?: string

  // Computed fields added during processing
  typeClean?: string
  num?: number
  nb_row?: number
  datasetName?: string
  datasetType?: string
  folder_id?: string | number
  folderName?: string
  owner_id?: string | number
  ownerName?: string
  manager_id?: string | number
  managerName?: string
  modalities?: Modality[]
  values?: Value[]
  valuesPreview?: Value[]
  nbValue?: number
  sourceIds?: (string | number)[]
  derivedIds?: (string | number)[]
  hasFreq?: boolean
  freqPreview?: (Freq & {
    total?: number
    max?: number
  })[]
}

export interface Modality extends BaseEntity {
  folder_id?: string | number
  type?: string

  // Computed fields added during processing
  typeClean?: string
  nbVariable?: number
  variables?: Variable[]
  values?: Value[]
  valuesPreview?: Value[]
  nbValue?: number
}

export interface Folder extends EntityWithRelations {
  parent_id?: string | number
  manager_id?: string | number
  owner_id?: string | number
  tag_ids?: string
  doc_ids?: string
  data_path?: string
  delivery_format?: string
  git_code?: string
  last_update_date?: string
  localisation?: string
  metadata_path?: string
  survey_type?: string
  start_date?: string
  end_date?: string
  updating_each?: string
  no_more_update?: boolean

  // Computed fields added during processing
  ownerName?: string
  managerName?: string
  nbChild?: number
  nbChildRecursive?: number
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
  nextUpdateDate?: string
}

export interface Institution extends EntityWithRelations {
  parent_id?: string | number
  tag_ids?: string
  doc_ids?: string
  email?: string
  phone?: string
  start_date?: string
  end_date?: string

  // Computed fields added during processing
  nbChild?: number
  nbChildRecursive?: number
  nbFolder?: number
  nbDataset?: number
  nbFolderRecursive?: number
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
}

export interface Tag extends EntityWithRelations {
  parent_id?: string | number
  docIds?: string

  // Computed fields added during processing
  nbInstitution?: number
  nbFolder?: number
  nbDataset?: number
  nbVariable?: number
  nbChild?: number
  nbChildRecursive?: number
  nbInstitutionRecursive?: number
  nbFolderRecursive?: number
  nbDocRecursive?: number
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
}

export type TagWithChildren = Tag & {
  children?: { [key: string]: TagWithChildren }
}

export interface Doc extends BaseEntity {
  path?: string
  type?: string
  last_update?: number
  last_update_date?: string

  // Computed fields added during processing
  entity?: string
  entity_id?: string | number
  nbInstitution?: number
  nbFolder?: number
  nbDataset?: number
  nbTag?: number
}

// Meta entities (for metadata datasets)
export interface MetaVariable extends BaseEntity {
  metaDataset_id: string | number
  type?: string
  values?: unknown[]
  is_in_meta?: boolean
  is_in_data?: boolean

  // Computed fields
  isMeta?: boolean
  typeClean?: string
  nbValue?: number
  dataset_id?: string | number
  datasetName?: string
  nb_row?: number
  metaFolder_id?: string | number
  folderName?: string
  metaLocalisation?: string
  key?: string
}

export interface MetaDataset extends BaseEntity {
  metaFolder_id: string | number
  is_in_meta?: boolean
  is_in_data?: boolean
  lastUpdateTimestamp?: number

  // Computed fields
  isMeta?: boolean
  folder?: { id: string | number }
  folderName?: string
  nbVariable?: number
  metaLocalisation?: string
  nb_row?: number
}

export interface MetaFolder extends BaseEntity {
  // Computed fields
  isMeta?: boolean
  nbDataset?: number
  nbVariable?: number
}

export interface Evolution {
  id?: string | number
  entity: EntityName
  entity_id: string | number
  type: string
  timestamp: number
  name?: string | number
  parent_entity_id?: string | number
  _deleted?: boolean
  _entity?: string
  _entityClean?: string
  typeClean?: string
  parentEntity?: EntityName
  parentEntityClean?: string
  time?: string
  parentName?: string
  parentDeleted?: boolean
  isFavorite?: boolean
  date?: string
  folder_id?: string | number
  _toHide?: boolean
}

// Entity type mapping for type-safe database operations
export interface EntityTypeMap {
  config: Config
  dataset: Dataset
  variable: Variable
  modality: Modality
  value: Value
  freq: Freq
  folder: Folder
  institution: Institution
  tag: Tag
  doc: Doc
  evolution: Evolution
  metaVariable: MetaVariable
  metaDataset: MetaDataset
  metaFolder: MetaFolder
  favorite: Favorite
  filter: Filter
  filter_active: FilterActive
  log: Log
  option: Option
  search_history: SearchHistory
}

export type EntityName = keyof EntityTypeMap
export type AnyEntity = EntityTypeMap[EntityName]
