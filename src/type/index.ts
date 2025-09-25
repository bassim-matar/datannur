// Base types (no dependencies)
export type {
  BaseEntity,
  Config,
  Value,
  Freq,
  Favorite,
  FilterActive,
  Log,
  Option,
  SearchHistory,
  Filter,
  Row,
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
  TagWithChildren,
  Doc,
  MetaVariable,
  MetaDataset,
  MetaFolder,
  Evolution,
  AnyEntity,
  EntityTypeMap,
  EntityName,
} from './entity'

// Global declarations are auto-imported
import './global'
import './module'
