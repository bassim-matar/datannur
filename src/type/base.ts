// Base entity type without circular dependencies
export type BaseEntity = {
  id: string | number
  name: string
  description?: string

  // Fields added during processing in db.ts
  _entity?: string
  _entityClean?: string
  isFavorite?: boolean
  parents?: BaseEntity[]
  parentsRelative?: BaseEntity[]
  entities?: { name: string; nb: number }[]
  period?: string
  periodDuration?: string
  minimumDeep?: number
  noIndent?: boolean
}

// General types
export type Row = Record<string, unknown>

// Core database entities (no dependencies)
export type Config = {
  id: string
  value: string
}

export type Value = {
  modality_id: string | number
  value: string | null
  description?: string

  // Computed fields added during processing
  modalityName?: string
}

export type Freq = {
  variable_id: string | number
  value: string
  freq: number
}

// User data entities
export type Favorite = {
  id: string | number
  entity_id: string | number
  entity: string
  timestamp: number
}

export type FilterActive = {
  id: string
  is_active: boolean
}

export type Log = {
  id: string | number
  entity_id: string | number
  entity: string
  action: string
  timestamp: number
}

export type Option = {
  id: string
  value: string
}

export type SearchHistory = {
  id: string | number
  entity_id: string | number
  entity: string
  timestamp: number
}

// Filter type for local filters
export type Filter = {
  id: string
  name: string
}
