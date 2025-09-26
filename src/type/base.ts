// Base entity interface without circular dependencies
export interface BaseEntity {
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
export interface Config {
  id: string
  value: string
}

export interface Value {
  modality_id: string | number
  value: string | null
  description?: string

  // Computed fields added during processing
  modalityName?: string
}

export interface Freq {
  variable_id: string | number
  value: string
  freq: number
}

// User data entities
export interface Favorite {
  id: string | number
  entity_id: string | number
  entity: string
  timestamp: number
}

export interface FilterActive {
  id: string
  is_active: boolean
}

export interface Log {
  id: string | number
  entity_id: string | number
  entity: string
  action: string
  timestamp: number
}

export interface Option {
  id: string
  value: string
}

export interface SearchHistory {
  id: string | number
  entity_id: string | number
  entity: string
  timestamp: number
}

// Filter type for local filters
export interface Filter {
  id: string
  name: string
}
