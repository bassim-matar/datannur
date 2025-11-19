import db from '@db'
import schemaDoc from './schema-documentation.md?raw'
import type {
  LLMContextSchema,
  DBStatsSchema,
  UserContextSchema,
  UIStateSchema,
  DatasetSchema,
  VariableSchema,
  FolderSchema,
} from './llm-schema'
import type { EntityName } from '@type'

/**
 * Build database statistics overview
 */
function getDBStats(): DBStatsSchema {
  const datasets = db.getAll('dataset')
  const variables = db.getAll('variable')

  const datasetsByType: { [type: string]: number } = {}
  for (const dataset of datasets) {
    const type = (dataset as { type?: string }).type ?? 'unknown'
    datasetsByType[type] = (datasetsByType[type] ?? 0) + 1
  }

  const variablesByType: { [type: string]: number } = {}
  for (const variable of variables) {
    const varTyped = variable as { typeClean?: string; type?: string }
    const type = varTyped.typeClean ?? varTyped.type ?? 'unknown'
    variablesByType[type] = (variablesByType[type] ?? 0) + 1
  }

  const periods = datasets
    .map((d: unknown) => {
      const dataset = d as { startDate?: string; endDate?: string }
      return [dataset.startDate, dataset.endDate]
    })
    .flat()
    .filter(Boolean) as string[]

  return {
    nbInstitution: db.getAll('institution').length,
    nbFolder: db.getAll('folder').length,
    nbDataset: db.getAll('dataset').length,
    nbVariable: db.getAll('variable').length,
    nbModality: db.getAll('modality').length,
    nbTag: db.getAll('tag').length,
    nbDoc: db.getAll('doc').length,
    datasetsByType,
    variablesByType,
    periodRange:
      periods.length > 0
        ? {
            min: Math.min(...periods.map(p => parseInt(p))).toString(),
            max: Math.max(...periods.map(p => parseInt(p))).toString(),
          }
        : undefined,
  }
}

/**
 * Build user context (favorites, history, preferences)
 */
function getUserContext(): UserContextSchema {
  return {
    favorites: {
      dataset: [],
      variable: [],
      folder: [],
      institution: [],
      tag: [],
      modality: [],
      doc: [],
    },
    searchHistory: [],
    options: {
      darkMode: false,
      language: 'en',
    },
    logs: [],
  }
}

/**
 * Build UI state (current route, active filters, etc.)
 */
function getUIState(): UIStateSchema {
  return {
    currentPage: '/',
    currentTab: undefined,
    activeFilters: undefined,
    viewMode: 'list',
  }
}

/**
 * Get sample data for context
 * Limits data to avoid token overflow
 */
function getSampleData(options: {
  entities?: EntityName[]
  maxItems?: number
}): {
  datasets?: DatasetSchema[]
  variables?: VariableSchema[]
  folders?: FolderSchema[]
} {
  const { maxItems = 20 } = options
  const samples: {
    datasets?: DatasetSchema[]
    variables?: VariableSchema[]
    folders?: FolderSchema[]
  } = {}

  if (!options.entities || options.entities.includes('dataset')) {
    samples.datasets = db
      .getAll('dataset')
      .slice(0, maxItems) as DatasetSchema[]
  }

  if (!options.entities || options.entities.includes('variable')) {
    samples.variables = db
      .getAll('variable')
      .slice(0, maxItems) as VariableSchema[]
  }

  if (!options.entities || options.entities.includes('folder')) {
    samples.folders = db.getAll('folder').slice(0, maxItems) as FolderSchema[]
  }

  return samples
}

/**
 * Build complete LLM context
 *
 * @param options Configuration options
 * @param options.includeFullData Include sample data (expensive in tokens)
 * @param options.entities Which entities to include in samples
 * @param options.maxItems Maximum items per entity type
 */
export function buildLLMContext(
  options: {
    includeFullData?: boolean
    entities?: EntityName[]
    maxItems?: number
  } = {},
): LLMContextSchema {
  const context: LLMContextSchema = {
    stats: getDBStats(),
    user: getUserContext(),
    ui: getUIState(),
  }

  if (options.includeFullData) {
    context.samples = getSampleData({
      entities: options.entities,
      maxItems: options.maxItems,
    })
  }

  return context
}

/**
 * Get schema documentation as text for LLM system prompt
 * This generates a markdown description of the data model
 */
export function getSchemaDocumentation(): string {
  return schemaDoc
}
