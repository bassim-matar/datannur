/**
 * LLM Tools - Functions that the LLM can call to interact with the app
 *
 * These tools allow the LLM to:
 * - Query the database
 * - Navigate the app
 * - Manipulate UI state
 * - Access user data
 */

import db from '@db'
import { router } from 'svelte-fileapp'
import Favorites from '@favorite/favorites'
import MainFilter from '@lib/main-filter'
import Search from '@search/search'
import type { EntityName, Filter } from '@type'

/**
 * Tool definitions for LLM
 * Each tool has a name, description, parameters schema, and handler function
 */

export type LLMTool = {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: {
      [key: string]: { type: string; description: string; enum?: string[] }
    }
    required: string[]
  }
  handler: (params: unknown) => unknown
}

/**
 * Database query tools
 */

const findEntities: LLMTool = {
  name: 'findEntities',
  description: 'Find entities matching criteria. Returns array of entities.',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type to query',
        enum: [
          'dataset',
          'variable',
          'folder',
          'institution',
          'tag',
          'modality',
          'doc',
        ],
      },
      criteria: {
        type: 'object',
        description: 'Filter criteria (e.g., {type: "panel", folderId: "123"})',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 50)',
      },
    },
    required: ['entity'],
  },
  handler: ((params: {
    entity: EntityName
    criteria?: Record<string, unknown>
    limit?: number
  }) => {
    const { entity, criteria = {}, limit = 50 } = params
    const results = db.getAll(
      entity,
      criteria as Record<string, string | number>,
    )
    return results.slice(0, limit)
  }) as (params: unknown) => unknown,
}

const getEntity: LLMTool = {
  name: 'getEntity',
  description: 'Get a single entity by ID',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type',
        enum: [
          'dataset',
          'variable',
          'folder',
          'institution',
          'tag',
          'modality',
          'doc',
        ],
      },
      id: {
        type: 'string',
        description: 'Entity ID',
      },
    },
    required: ['entity', 'id'],
  },
  handler: ((params: { entity: EntityName; id: string }) => {
    return db.get(params.entity, params.id)
  }) as (params: unknown) => unknown,
}

const countEntities: LLMTool = {
  name: 'countEntities',
  description: 'Count entities matching criteria',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type to count',
        enum: [
          'dataset',
          'variable',
          'folder',
          'institution',
          'tag',
          'modality',
          'doc',
        ],
      },
      criteria: {
        type: 'object',
        description: 'Filter criteria',
      },
    },
    required: ['entity'],
  },
  handler: ((params: {
    entity: EntityName
    criteria?: Record<string, unknown>
  }) => {
    return db.getAll(
      params.entity,
      params.criteria as Record<string, string | number> | undefined,
    ).length
  }) as (params: unknown) => unknown,
}

/**
 * Search tools
 */

const searchInCatalog: LLMTool = {
  name: 'searchInCatalog',
  description: 'Full-text search across datasets and variables',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query',
      },
      entityType: {
        type: 'string',
        description: 'Limit to entity type',
        enum: ['dataset', 'variable', 'all'],
      },
      limit: {
        type: 'number',
        description: 'Maximum results (default: 20)',
      },
    },
    required: ['query'],
  },
  handler: (async (params: {
    query: string
    entityType?: 'dataset' | 'variable' | 'all'
    limit?: number
  }) => {
    const { query, entityType = 'all', limit = 20 } = params

    if (entityType === 'dataset') {
      const results = await Search.find(query)
      return results
        .filter((r: { entity: string }) => r.entity === 'dataset')
        .slice(0, limit)
    }
    if (entityType === 'variable') {
      const results = await Search.find(query)
      return results
        .filter((r: { entity: string }) => r.entity === 'variable')
        .slice(0, limit)
    }

    const results = await Search.find(query)
    return results.slice(0, limit)
  }) as (params: unknown) => unknown,
}

/**
 * Aggregation & analysis tools
 */

const groupBy: LLMTool = {
  name: 'groupBy',
  description: 'Group entities by field and count occurrences',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type',
        enum: [
          'dataset',
          'variable',
          'folder',
          'institution',
          'tag',
          'modality',
        ],
      },
      field: {
        type: 'string',
        description: 'Field to group by (e.g., "type", "folderId")',
      },
      criteria: {
        type: 'object',
        description: 'Pre-filter criteria',
      },
    },
    required: ['entity', 'field'],
  },
  handler: ((params: {
    entity: EntityName
    field: string
    criteria?: Record<string, unknown>
  }) => {
    const entities = db.getAll(
      params.entity,
      params.criteria as Record<string, string | number> | undefined,
    )
    const groups: { [key: string]: number } = {}

    for (const entity of entities) {
      const value = (entity as Record<string, unknown>)[params.field]
      const key = value?.toString() ?? 'null'
      groups[key] = (groups[key] ?? 0) + 1
    }

    return groups
  }) as (params: unknown) => unknown,
}

const getStatistics: LLMTool = {
  name: 'getStatistics',
  description: 'Get statistical summary of a numeric field',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type',
        enum: ['dataset', 'variable'],
      },
      field: {
        type: 'string',
        description: 'Numeric field (e.g., "nbRow", "nbDistinct")',
      },
      criteria: {
        type: 'object',
        description: 'Filter criteria',
      },
    },
    required: ['entity', 'field'],
  },
  handler: ((params: {
    entity: 'dataset' | 'variable'
    field: string
    criteria?: Record<string, unknown>
  }) => {
    const entities = db.getAll(
      params.entity,
      params.criteria as Record<string, string | number> | undefined,
    )
    const values = entities
      .map((e: unknown) => (e as Record<string, unknown>)[params.field])
      .filter((v: unknown) => typeof v === 'number') as number[]

    if (values.length === 0) return null

    const sum = values.reduce((a, b) => a + b, 0)
    const sorted = [...values].sort((a, b) => a - b)

    return {
      count: values.length,
      sum,
      mean: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
    }
  }) as (params: unknown) => unknown,
}

const getRelatedEntities: LLMTool = {
  name: 'getRelatedEntities',
  description:
    'Get entities related to a given entity (e.g., variables of a dataset)',
  parameters: {
    type: 'object',
    properties: {
      entityType: {
        type: 'string',
        description: 'Source entity type',
        enum: ['dataset', 'folder', 'institution'],
      },
      entityId: {
        type: 'string',
        description: 'Source entity ID',
      },
      relationType: {
        type: 'string',
        description: 'Type of relation to fetch',
        enum: ['variables', 'datasets', 'tags', 'docs'],
      },
    },
    required: ['entityType', 'entityId', 'relationType'],
  },
  handler: ((params: {
    entityType: EntityName
    entityId: string
    relationType: string
  }) => {
    const { entityType, entityId, relationType } = params
    const entity = db.get(entityType, entityId)

    if (!entity) return null

    if (relationType === 'variables' && entityType === 'dataset') {
      return db.getAll('variable', { dataset: entityId })
    }

    if (relationType === 'datasets' && entityType === 'folder') {
      return db.getAll('dataset', { folder: entityId })
    }

    if (relationType === 'tags') {
      const tagIds = (entity as { tagIds?: string }).tagIds
      if (!tagIds) return []
      return tagIds
        .split(',')
        .map((id: string) => db.get('tag', id.trim()))
        .filter(Boolean)
    }

    if (relationType === 'docs') {
      const docIds = (entity as { docIds?: string }).docIds
      if (!docIds) return []
      return docIds
        .split(',')
        .map((id: string) => db.get('doc', id.trim()))
        .filter(Boolean)
    }

    return null
  }) as (params: unknown) => unknown,
}

/**
 * Navigation tools
 */

const navigate: LLMTool = {
  name: 'navigate',
  description: 'Navigate to a page in the app',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Route path (e.g., "/dataset/123", "/variable/456", "/")',
      },
    },
    required: ['path'],
  },
  handler: ((params: { path: string }) => {
    router.navigate(params.path)
    return { success: true, path: params.path }
  }) as (params: unknown) => unknown,
}

/**
 * User data tools
 */

const toggleFavorite: LLMTool = {
  name: 'toggleFavorite',
  description: 'Add or remove entity from favorites',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type',
        enum: [
          'dataset',
          'variable',
          'folder',
          'institution',
          'tag',
          'modality',
          'doc',
        ],
      },
      id: {
        type: 'string',
        description: 'Entity ID',
      },
      action: {
        type: 'string',
        description: 'Action to perform',
        enum: ['add', 'remove', 'toggle'],
      },
    },
    required: ['entity', 'id'],
  },
  handler: ((params: {
    entity: EntityName
    id: string
    action?: 'add' | 'remove' | 'toggle'
  }) => {
    const { entity, id, action = 'toggle' } = params
    const item = db.get(entity, id)

    if (!item) return { success: false, error: 'Entity not found' }

    const isFavorite = (item as { isFavorite?: boolean }).isFavorite ?? false

    if (action === 'add' || (action === 'toggle' && !isFavorite)) {
      Favorites.add(entity as Parameters<typeof Favorites.add>[0], id)
      return { success: true, action: 'added', isFavorite: true }
    } else {
      Favorites.remove(entity as Parameters<typeof Favorites.remove>[0], id)
      return { success: true, action: 'removed', isFavorite: false }
    }
  }) as (params: unknown) => unknown,
}

/**
 * Filter tools
 */

const applyFilter: LLMTool = {
  name: 'applyFilter',
  description: 'Apply filters to the current view',
  parameters: {
    type: 'object',
    properties: {
      filters: {
        type: 'object',
        description:
          'Filter configuration (e.g., {type: "panel", period: {start: "2020"}})',
      },
    },
    required: ['filters'],
  },
  handler: ((params: { filters: Filter }) => {
    MainFilter.save([params.filters])
    return { success: true, filters: params.filters }
  }) as (params: unknown) => unknown,
}

const clearFilters: LLMTool = {
  name: 'clearFilters',
  description: 'Clear all active filters',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: (() => {
    MainFilter.save([])
    return { success: true }
  }) as (params: unknown) => unknown,
}

/**
 * All available tools
 */
export const llmTools: LLMTool[] = [
  // Query tools
  findEntities,
  getEntity,
  countEntities,
  searchInCatalog,

  // Analysis tools
  groupBy,
  getStatistics,
  getRelatedEntities,

  // Navigation tools
  navigate,

  // User data tools
  toggleFavorite,

  // Filter tools
  applyFilter,
  clearFilters,
]

export type ToolDefinition = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: {
        [key: string]: { type: string; description: string; enum?: string[] }
      }
      required: string[]
    }
  }
}

/**
 * Get tool definitions in OpenAI function calling format
 */
export function getToolDefinitions(): ToolDefinition[] {
  return llmTools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))
}

/**
 * Execute a tool by name with parameters
 */
export function executeTool(toolName: string, parameters: unknown): unknown {
  const tool = llmTools.find(t => t.name === toolName)

  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`)
  }

  try {
    return tool.handler(parameters)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    }
  }
}

/**
 * Get tools documentation for system prompt
 */
export function getToolsDocumentation(): string {
  return `
# Available Tools

You can call these functions to interact with the data catalog:

## Query Tools

**findEntities** - Find entities matching criteria
- entity: dataset|variable|folder|institution|tag|modality|doc
- criteria?: object (e.g., {type: "panel", folderId: "123"})
- limit?: number (default: 50)

**getEntity** - Get single entity by ID
- entity: dataset|variable|folder|...
- id: string

**countEntities** - Count matching entities
- entity: dataset|variable|folder|...
- criteria?: object

**searchInCatalog** - Full-text search
- query: string
- entityType?: dataset|variable|all
- limit?: number (default: 20)

## Analysis Tools

**groupBy** - Group and count by field
- entity: dataset|variable|folder|...
- field: string (e.g., "type", "folderId")
- criteria?: object

**getStatistics** - Statistical summary of numeric field
- entity: dataset|variable
- field: string (e.g., "nbRow", "nbDistinct")
- criteria?: object
Returns: {count, sum, mean, min, max, median}

**getRelatedEntities** - Get related entities
- entityType: dataset|folder|institution
- entityId: string
- relationType: variables|datasets|tags|docs

## Navigation Tools

**navigate** - Navigate to page
- path: string (e.g., "/dataset/123", "/")

## User Data Tools

**toggleFavorite** - Add/remove favorite
- entity: dataset|variable|folder|...
- id: string
- action?: add|remove|toggle

## Filter Tools

**applyFilter** - Apply filters to view
- filters: object

**clearFilters** - Clear all filters

## Usage Examples

Find panel datasets:
\`\`\`json
{
  "name": "findEntities",
  "parameters": {
    "entity": "dataset",
    "criteria": {"type": "panel"},
    "limit": 10
  }
}
\`\`\`

Count variables by type:
\`\`\`json
{
  "name": "groupBy",
  "parameters": {
    "entity": "variable",
    "field": "typeClean"
  }
}
\`\`\`

Get dataset statistics:
\`\`\`json
{
  "name": "getStatistics",
  "parameters": {
    "entity": "dataset",
    "field": "nbRow"
  }
}
\`\`\`
`.trim()
}
