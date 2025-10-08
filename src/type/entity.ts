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
import { parentEntities, evolutionTypes } from '../lib/constant'

// Extended base entity with relations (defined after Tag and Doc)
export type EntityWithRelations = BaseEntity & {
  tags?: Tag[]
  docs?: Doc[]
  docsRecursive?: (Doc & { inherited?: string })[]
}

export type Dataset = EntityWithRelations & {
  folderId?: string | number
  managerId?: string | number
  ownerId?: string | number
  tagIds?: string
  docIds?: string
  dataPath?: string
  deliveryFormat?: string
  type?: string
  link?: string
  localisation?: string
  nbRow?: number
  startDate?: string
  endDate?: string
  lastUpdateDate?: string
  updatingEach?: string
  noMoreUpdate?: boolean

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

export type FreqPreview = Freq & {
  total: number
  max: number
}

export type Variable = BaseEntity & {
  datasetId: string | number
  modalityIds?: string
  tagIds?: string
  originalName?: string
  key?: string | boolean
  nbDistinct?: number
  nbDuplicate?: number
  nbMissing?: number
  type?: string
  startDate?: string
  endDate?: string
  sourceVarIds?: string

  // Computed fields added during processing
  typeClean?: string
  num?: number
  nbRow?: number
  datasetName?: string
  datasetType?: string
  folderId?: string | number
  folderName?: string
  ownerId?: string | number
  ownerName?: string
  managerId?: string | number
  managerName?: string
  modalities?: Modality[]
  values?: Value[]
  valuesPreview?: Value[]
  nbValue?: number
  sourceIds?: (string | number)[]
  derivedIds?: (string | number)[]
  hasFreq?: boolean
  freqPreview?: FreqPreview[]
}

export type Modality = BaseEntity & {
  folderId?: string | number
  type?: string

  // Computed fields added during processing
  typeClean?: string
  nbVariable?: number
  variables?: Variable[]
  values?: Value[]
  valuesPreview?: Value[]
  nbValue?: number
}

export type Folder = EntityWithRelations & {
  parentId?: string | number
  managerId?: string | number
  ownerId?: string | number
  tagIds?: string
  docIds?: string
  dataPath?: string
  deliveryFormat?: string
  gitCode?: string
  lastUpdateDate?: string
  localisation?: string
  metadataPath?: string
  surveyType?: string
  startDate?: string
  endDate?: string
  updatingEach?: string
  noMoreUpdate?: boolean

  // Computed fields added during processing
  ownerName?: string
  managerName?: string
  nbChild?: number
  nbChildRecursive?: number
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
  nextUpdateDate?: string
}

export type Institution = EntityWithRelations & {
  parentId?: string | number
  tagIds?: string
  docIds?: string
  email?: string
  phone?: string
  startDate?: string
  endDate?: string

  // Computed fields added during processing
  nbChild?: number
  nbChildRecursive?: number
  nbFolder?: number
  nbDataset?: number
  nbFolderRecursive?: number
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
}

export type Tag = EntityWithRelations & {
  parentId?: string | number
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

export type Doc = BaseEntity & {
  path?: string
  type?: string
  lastUpdate?: number
  lastUpdateDate?: string

  // Computed fields added during processing
  entity?: string
  entityId?: string | number
  nbInstitution?: number
  nbFolder?: number
  nbDataset?: number
  nbTag?: number
}

// Meta entities (for metadata datasets)
export type MetaVariable = BaseEntity & {
  metaDatasetId: string | number
  type?: string
  values?: Value[]
  isInMeta?: boolean
  isInData?: boolean

  // Computed fields
  isMeta?: boolean
  typeClean?: string
  nbValue?: number
  datasetId?: string | number
  datasetName?: string
  nbRow?: number
  metaFolderId?: string | number
  folderName?: string
  metaLocalisation?: string
  key?: string
}

export type MetaDataset = BaseEntity & {
  metaFolderId: string | number
  isInMeta?: boolean
  isInData?: boolean
  lastUpdateTimestamp?: number

  // Computed fields
  isMeta?: boolean
  folder?: { id: string | number }
  folderName?: string
  nbVariable?: number
  metaLocalisation?: string
  nbRow?: number
}

export type MetaFolder = BaseEntity & {
  // Computed fields
  isMeta?: boolean
  nbDataset?: number
  nbVariable?: number
}

export type Evolution = {
  id?: string | number
  entity: MainEntityName
  entityId: string | number
  type: keyof typeof evolutionTypes
  timestamp: number
  name?: string
  parentEntityId?: string | number
  oldValue?: string
  newValue?: string
  variable?: string
  _deleted?: boolean
  _entity?: MainEntityName
  _entityClean?: string
  typeClean?: string
  parentEntity?: MainEntityName
  parentEntityClean?: string
  time?: string
  parentName?: string
  parentDeleted?: boolean
  isFavorite?: boolean
  favoriteTimestamp?: number
  date?: string
  folderId?: string | number
  _toHide?: boolean
}

// Entity type mapping for type-safe database operations
export type EntityTypeMap = {
  config: Config
  dataset: Dataset
  variable: Variable
  modality: Modality
  value: Value
  freq: Freq
  folder: Folder
  institution: Institution
  owner: Institution
  manager: Institution
  tag: Tag
  doc: Doc
  evolution: Evolution
  metaVariable: MetaVariable
  metaDataset: MetaDataset
  metaFolder: MetaFolder
  favorite: Favorite
  filter: Filter
  filterActive: FilterActive
  log: Log
  option: Option
  searchHistory: SearchHistory
  parent: BaseEntity
}

export type EntityName = keyof EntityTypeMap
export type AnyEntity = EntityTypeMap[EntityName]

export type MainEntityName = keyof typeof parentEntities
export type MainEntityTypeMap = Pick<EntityTypeMap, MainEntityName>
export type MainEntity = MainEntityTypeMap[MainEntityName]

export type MainEntityItem = MainEntity & {
  _deleted: boolean
  parentEntityId?: string | number
}

export type FavoritableEntityName =
  | 'institution'
  | 'folder'
  | 'tag'
  | 'doc'
  | 'dataset'
  | 'variable'
  | 'modality'
export type FavoritableEntityMap = Pick<EntityTypeMap, FavoritableEntityName>
export type FavoritableEntity = FavoritableEntityMap[FavoritableEntityName]
