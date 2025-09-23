// Base types (no dependencies)
export type {
  BaseEntity,
  Config,
  Value,
  Freq,
  Evolution,
  Favorite,
  FilterActive,
  Log,
  Option,
  SearchHistory,
  Filter,
} from './base'

// Entity types (business logic)
export type {
  EntityWithRelations,
  Dataset,
  Variable,
  Modality,
  Folder,
  Institution,
  Tag,
  Doc,
  MetaVariable,
  MetaDataset,
  MetaFolder,
  AnyEntity,
  EntityTypeMap,
  EntityName,
} from './entity'

// Global declarations are auto-imported
import './global'
import './module'
