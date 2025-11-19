/**
 * Enhanced TypeScript schemas for LLM context
 * These types include both raw database fields and computed/processed fields
 * with comprehensive documentation for LLM understanding
 */

/**
 * Dataset - A collection of tabular data
 *
 * Source: Raw from database → Enhanced during app initialization
 * Query: db.dataset.find(criteria), db.dataset.get(id)
 */
export type DatasetSchema = {
  // Raw database fields
  id: string
  folderId?: string | number
  ownerId?: string | number
  managerId?: string | number
  name?: string
  description?: string
  type?: string // "panel", "cross-section", "time-series", etc.
  nbRow?: number
  startDate?: string // Format: YYYY, YYYY-MM, or YYYY-MM-DD
  endDate?: string
  lastUpdateDate?: string
  updatingEach?: string
  noMoreUpdate?: boolean
  dataPath?: string
  deliveryFormat?: string // "CSV", "XML", etc.
  link?: string
  localisation?: string
  tagIds?: string // Comma-separated IDs
  docIds?: string

  // Computed fields (added by app)
  typeClean?: string // Human-readable type
  folderName?: string // Denormalized
  ownerName?: string
  managerName?: string
  nbVariable?: number
  nextUpdateDate?: string
  period?: string // Formatted: "2020 - 2025"
  periodDuration?: string // "5 ans"

  // Relations (loaded on demand)
  tags?: TagSchema[]
  docs?: DocSchema[]
  variables?: VariableSchema[]

  // User context
  isFavorite?: boolean
  favoriteTimestamp?: number
}

/**
 * Variable - A column/field within a dataset
 *
 * Source: Raw from database → Enhanced with dataset info
 * Query: db.variable.find({datasetId: '123'})
 */
export type VariableSchema = {
  // Raw database fields
  id: string
  datasetId: string | number
  name?: string
  originalName?: string
  description?: string
  type?: string // Data type: "string", "integer", "float", etc.
  key?: boolean | string // Is unique key
  nbDistinct?: number
  nbDuplicate?: number
  nbMissing?: number
  startDate?: string
  endDate?: string
  modalityIds?: string
  tagIds?: string
  sourceVarIds?: string // Lineage: source variable IDs

  // Computed fields
  typeClean?: string
  num?: number // Position in dataset (1, 2, 3...)
  nbRow?: number // Inherited from dataset
  datasetName?: string // Denormalized
  datasetType?: string
  folderId?: string | number // Inherited from dataset
  folderName?: string
  ownerId?: string | number
  ownerName?: string
  managerId?: string | number
  managerName?: string
  period?: string
  periodDuration?: string
  nbValue?: number // Count of distinct values
  hasFreq?: boolean // Has frequency distribution

  // Relations
  modalities?: ModalitySchema[]
  tags?: TagSchema[]
  values?: ValueSchema[] // Sample values
  valuesPreview?: ValueSchema[]
  freqPreview?: FreqPreviewSchema[]

  // User context
  isFavorite?: boolean
  favoriteTimestamp?: number
}

/**
 * Modality - A standardized nomenclature/codification
 *
 * Used to harmonize categorical values across datasets
 * Query: db.modality.find()
 */
export type ModalitySchema = {
  id: string
  folderId?: string | number
  name?: string
  description?: string
  type?: string

  // Computed fields
  folderName?: string
  typeClean?: string
  nbVariable?: number
  nbValue?: number

  // Relations
  variables?: VariableSchema[]
  values?: ValueSchema[]
  valuesPreview?: ValueSchema[]

  // User context
  isFavorite?: boolean
}

/**
 * Folder - Hierarchical organization of datasets
 *
 * Can be nested (recursive parent-child)
 * Query: db.folder.find(), db.folder.get(id)
 */
export type FolderSchema = {
  id: string
  parentId?: string | number // Parent folder (recursive)
  ownerId?: string | number
  managerId?: string | number
  name?: string
  description?: string
  surveyType?: string
  dataPath?: string
  metadataPath?: string
  gitCode?: string
  localisation?: string
  startDate?: string
  endDate?: string
  lastUpdateDate?: string
  updatingEach?: string
  noMoreUpdate?: boolean
  tagIds?: string
  docIds?: string

  // Computed fields
  ownerName?: string
  managerName?: string
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
  nextUpdateDate?: string
  period?: string
  periodDuration?: string

  // Recursive hierarchy
  parents?: FolderSchema[]
  parentsRelative?: FolderSchema[]
  minimumDeep?: number
  nbChild?: number
  nbChildRecursive?: number
  pathString?: string // Full path

  // Relations
  tags?: TagSchema[]
  docs?: DocSchema[]

  // User context
  isFavorite?: boolean
}

/**
 * Institution - Organization that owns or manages data
 *
 * Can be hierarchical
 * Query: db.institution.find()
 */
export type InstitutionSchema = {
  id: string
  parentId?: string | number
  name?: string
  description?: string
  email?: string
  phone?: string
  startDate?: string
  endDate?: string
  tagIds?: string
  docIds?: string

  // Computed fields
  nbFolder?: number
  nbDataset?: number
  nbFolderRecursive?: number
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
  period?: string

  // Recursive hierarchy
  parents?: InstitutionSchema[]

  // Relations
  tags?: TagSchema[]
  docs?: DocSchema[]

  // User context
  isFavorite?: boolean
}

/**
 * Tag - Keyword/label for categorization
 *
 * Hierarchical (parent-child)
 * Query: db.tag.find()
 */
export type TagSchema = {
  id: string
  parentId?: string | number
  name?: string
  description?: string
  docIds?: string

  // Computed fields
  entities?: Array<{ name: string; nb: number }> // Which entities use this tag
  nbInstitution?: number
  nbFolder?: number
  nbDataset?: number
  nbVariable?: number
  nbInstitutionRecursive?: number
  nbFolderRecursive?: number
  nbDatasetRecursive?: number
  nbVariableRecursive?: number
  nbDocRecursive?: number

  // Recursive hierarchy
  parents?: TagSchema[]

  // Relations
  docs?: DocSchema[]

  // User context
  isFavorite?: boolean
}

/**
 * Doc - Documentation/metadata file
 *
 * Links to datasets, folders, institutions, tags, variables
 * Query: db.doc.find()
 */
export type DocSchema = {
  id: string
  name?: string
  description?: string
  path?: string // File path
  type?: string // File type: "pdf", "html", "md", etc.
  lastUpdate?: number
  lastUpdateDate?: string

  // Computed fields
  entities?: Array<{ name: string; nb: number }>
  nbInstitution?: number
  nbFolder?: number
  nbDataset?: number
  nbVariable?: number
  nbTag?: number

  // Context (when attached to entity)
  entity?: string // Entity type
  entityId?: string | number
  inherited?: string // If inherited from parent

  // User context
  isFavorite?: boolean
}

/**
 * Value - Sample value from a variable
 */
export type ValueSchema = {
  id: string
  code: string // Raw value
  label?: string // Labeled value
}

/**
 * Freq - Frequency distribution preview
 */
export type FreqPreviewSchema = {
  code: string
  label?: string
  count: number
  total: number
  max: number
}

/**
 * User data - Runtime user state
 */
export type UserContextSchema = {
  favorites: {
    dataset?: string[]
    variable?: string[]
    folder?: string[]
    institution?: string[]
    tag?: string[]
    modality?: string[]
    doc?: string[]
  }
  searchHistory: Array<{
    id: number
    query: string
    timestamp: number
    results: number
  }>
  options: {
    darkMode?: boolean
    language?: string
    [key: string]: unknown
  }
  logs: Array<{
    id: number
    action: string
    entity: string
    entityId: string | number
    timestamp: number
  }>
}

/**
 * UI State - Current application context
 */
export type UIStateSchema = {
  currentPage: string // Route: "/", "/dataset/123", "/variable/456", etc.
  currentTab?: string // Active tab if on multi-tab page
  activeFilters?: {
    entity?: string
    type?: string
    period?: { start?: string; end?: string }
    tags?: string[]
    search?: string
    [key: string]: unknown
  }
  viewMode?: 'list' | 'grid' | 'table'
}

/**
 * Database statistics - Overview of catalog content
 */
export type DBStatsSchema = {
  nbInstitution: number
  nbFolder: number
  nbDataset: number
  nbVariable: number
  nbModality: number
  nbTag: number
  nbDoc: number

  datasetsByType?: { [type: string]: number }
  variablesByType?: { [type: string]: number }
  periodRange?: { min?: string; max?: string }
  lastUpdate?: string
}

/**
 * Complete LLM Context
 * This is the full context object sent to the LLM
 */
export type LLMContextSchema = {
  // Database statistics
  stats: DBStatsSchema

  // User context
  user: UserContextSchema

  // UI state
  ui: UIStateSchema

  // Sample data (optional, limited)
  samples?: {
    datasets?: DatasetSchema[]
    variables?: VariableSchema[]
    folders?: FolderSchema[]
  }
}

/**
 * Query helper documentation for LLM
 */
export const queryMethods = {
  find: 'db.entity.find(criteria?) → Entity[] - Find all matching entities',
  get: 'db.entity.get(id) → Entity | undefined - Get single entity by ID',
  count: 'db.entity.count(criteria?) → number - Count matching entities',
  getAll: 'db.entity.getAll(criteria?) → Entity[] - Alias for find()',
} as const

/**
 * Common query patterns for LLM reference
 */
export const queryExamples = {
  allDatasets: 'db.dataset.find()',
  datasetById: "db.dataset.get('dataset-123')",
  datasetsByFolder: "db.dataset.find({ folderId: '456' })",
  datasetsByType: "db.dataset.find({ type: 'panel' })",
  favoriteDatasets: 'db.dataset.find({ isFavorite: true })',

  variablesByDataset: "db.variable.find({ datasetId: '123' })",
  variableByName: "db.variable.find({ name: 'age' })",

  countDatasets: 'db.dataset.count()',
  countPanelDatasets: "db.dataset.count({ type: 'panel' })",
} as const
