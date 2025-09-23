import type {
  BaseEntity,
  Value,
  Freq,
  Config,
  Evolution,
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
  docs_recursive?: (Doc & { inherited?: string })[]
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
  type_clean?: string
  folder_name?: string
  owner_name?: string
  manager_name?: string
  nb_variable?: number
  source_ids?: Set<string | number>
  derived_ids?: Set<string | number>
  next_update_date?: string
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
  type_clean?: string
  num?: number
  nb_row?: number
  dataset_name?: string
  dataset_type?: string
  folder_id?: string | number
  folder_name?: string
  owner_id?: string | number
  owner_name?: string
  manager_id?: string | number
  manager_name?: string
  modalities?: Modality[]
  values?: Value[]
  values_preview?: Value[]
  nb_value?: number
  source_ids?: (string | number)[]
  derived_ids?: (string | number)[]
  has_freq?: boolean
  freq_preview?: (Freq & {
    total?: number
    max?: number
  })[]
}

export interface Modality extends BaseEntity {
  folder_id?: string | number
  type?: string

  // Computed fields added during processing
  type_clean?: string
  nb_variable?: number
  variables?: Variable[]
  values?: Value[]
  values_preview?: Value[]
  nb_value?: number
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
  owner_name?: string
  manager_name?: string
  nb_child?: number
  nb_child_recursive?: number
  nb_dataset_recursive?: number
  nb_variable_recursive?: number
  next_update_date?: string
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
  nb_child?: number
  nb_child_recursive?: number
  nb_folder?: number
  nb_dataset?: number
  nb_folder_recursive?: number
  nb_dataset_recursive?: number
  nb_variable_recursive?: number
}

export interface Tag extends EntityWithRelations {
  parent_id?: string | number
  doc_ids?: string

  // Computed fields added during processing
  nb_institution?: number
  nb_folder?: number
  nb_dataset?: number
  nb_variable?: number
  nb_child?: number
  nb_child_recursive?: number
  nb_institution_recursive?: number
  nb_folder_recursive?: number
  nb_doc_recursive?: number
  nb_dataset_recursive?: number
  nb_variable_recursive?: number
}

export interface Doc extends BaseEntity {
  path?: string
  type?: string
  last_update?: number

  // Computed fields added during processing
  last_update_date?: string
  entity?: string
  entity_id?: string | number
  nb_institution?: number
  nb_folder?: number
  nb_dataset?: number
  nb_tag?: number
}

// Meta entities (for metadata datasets)
export interface MetaVariable extends BaseEntity {
  metaDataset_id: string | number
  type?: string
  values?: any[]
  is_in_meta?: boolean
  is_in_data?: boolean

  // Computed fields
  is_meta?: boolean
  type_clean?: string
  nb_value?: number
  dataset_id?: string | number
  dataset_name?: string
  nb_row?: number
  metaFolder_id?: string | number
  folder_name?: string
  meta_localisation?: string
  key?: string
}

export interface MetaDataset extends BaseEntity {
  metaFolder_id: string | number
  is_in_meta?: boolean
  is_in_data?: boolean
  last_update_timestamp?: number

  // Computed fields
  is_meta?: boolean
  folder?: { id: string | number }
  folder_name?: string
  nb_variable?: number
  meta_localisation?: string
  nb_row?: number
}

export interface MetaFolder extends BaseEntity {
  // Computed fields
  is_meta?: boolean
  nb_dataset?: number
  nb_variable?: number
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
