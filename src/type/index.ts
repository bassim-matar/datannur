// Base types (no dependencies)
export type {
  BaseEntity,
  Config,
  NullableNumber,
  Value,
  Freq,
  Favorite,
  FilterActive,
  Log,
  Option,
  SearchHistory,
  Filter,
  Row,
  Column,
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
  FreqPreview,
  MetaVariable,
  MetaDataset,
  MetaFolder,
  Evolution,
  AnyEntity,
  EntityTypeMap,
  EntityName,
  MainEntityName,
  MainEntityTypeMap,
  MainEntity,
  MainEntityItem,
  FavoritableEntityName,
  FavoritableEntityMap,
  FavoritableEntity,
} from './entity'

// Global declarations are auto-imported
import './global'
import './module'
