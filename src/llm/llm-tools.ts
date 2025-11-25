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
import Search from '@search/search'
import type { EntityName, MainEntityName } from '@type'
import { mainEntityNames } from '@lib/constant'

/**
 * Tool definitions for LLM
 * Each tool has a name, description, parameters schema, and handler function
 */

export type LLMTool = {
  name: string
  description: string
  descriptionFr?: string
  parameters: {
    type: 'object'
    properties: {
      [key: string]: { type: string; description: string; enum?: string[] }
    }
    required: string[]
  }
  handler: (params: unknown) => unknown
}

const mainEntityEnumValues = Object.keys(mainEntityNames)

/**
 * Database query tools
 */

/**
 * Find entities with optional filtering
 * Returns count + lightweight list (max 20 items)
 */
function findEntitiesHelper(
  entity: MainEntityName,
  criteria?: Record<string, unknown>,
): {
  count: number
  items: Array<{ id: string | number; name: string }>
} {
  let entities = db.getAll(entity)

  if (criteria && Object.keys(criteria).length > 0) {
    entities = entities.filter(e =>
      Object.entries(criteria).every(
        ([key, value]) => (e as Record<string, unknown>)[key] === value,
      ),
    )
  }

  return {
    count: entities.length,
    items: entities.slice(0, 20).map(entity => ({
      id: entity.id as string | number,
      name: entity.name as string,
    })),
  }
}

const findEntities: LLMTool = {
  name: 'findEntities',
  description:
    'Find entities matching criteria. Returns total count + first 20 items (id, name). Use getEntity() to get full details.',
  descriptionFr:
    'Rechercher des entités avec critères. Retourne le total + les 20 premiers (id, name). Utiliser getEntity() pour les détails complets.',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type to query',
        enum: mainEntityEnumValues,
      },
      criteria: {
        type: 'object',
        description:
          'Filter criteria object. Matches entities where all specified fields equal the given values (e.g., {type: "panel"}, {folderId: "123", type: "cohort"})',
      },
    },
    required: ['entity'],
  },
  handler: ((params: {
    entity: MainEntityName
    criteria?: Record<string, unknown>
  }) => {
    const { entity, criteria } = params
    return findEntitiesHelper(entity, criteria)
  }) as (params: unknown) => unknown,
}

const getEntity: LLMTool = {
  name: 'getEntity',
  description: 'Get a single entity by ID',
  descriptionFr: 'Obtenir une entité par son ID',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type',
        enum: mainEntityEnumValues,
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

/**
 * Search tools
 */

const searchInCatalog: LLMTool = {
  name: 'searchInCatalog',
  description:
    'Full-text search across all entities. Returns lightweight results with id, name and entity type. Use getEntity() for full details.',
  descriptionFr:
    'Recherche plein texte dans toutes les entités. Retourne résultats légers avec id, name et type. Utiliser getEntity() pour les détails complets.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query',
      },
      entityType: {
        type: 'string',
        description: 'Limit to entity type (or "all" for all entities)',
        enum: [...mainEntityEnumValues, 'all'],
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
    entityType?: MainEntityName | 'all'
    limit?: number
  }) => {
    const { query, entityType = 'all', limit = 20 } = params

    const results = await Search.find(query)

    const filtered =
      entityType === 'all'
        ? results
        : results.filter((r: { entity: string }) => r.entity === entityType)

    return filtered
      .slice(0, limit)
      .map((r: { id: string | number; name: string; entity: string }) => ({
        id: r.id,
        name: r.name,
        entity: r.entity,
      }))
  }) as (params: unknown) => unknown,
}

/**
 * Aggregation & analysis tools
 */

const groupBy: LLMTool = {
  name: 'groupBy',
  description: 'Group entities by field and count occurrences',
  descriptionFr: 'Grouper les entités par champ et compter les occurrences',
  parameters: {
    type: 'object',
    properties: {
      entity: {
        type: 'string',
        description: 'Entity type',
        enum: mainEntityEnumValues,
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
    let entities = db.getAll(params.entity)

    if (params.criteria && Object.keys(params.criteria).length > 0) {
      entities = entities.filter((e: unknown) =>
        Object.entries(params.criteria!).every(
          ([key, value]) => (e as Record<string, unknown>)[key] === value,
        ),
      )
    }

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
  descriptionFr: "Obtenir un résumé statistique d'un champ numérique",
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
    let entities = db.getAll(params.entity, undefined)

    if (params.criteria && Object.keys(params.criteria).length > 0) {
      entities = entities.filter((e: unknown) =>
        Object.entries(params.criteria!).every(
          ([key, value]) => (e as Record<string, unknown>)[key] === value,
        ),
      )
    }

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

/**
 * Navigation tools
 */

const navigate: LLMTool = {
  name: 'navigate',
  description: 'Navigate to a page in the app',
  descriptionFr: "Naviguer vers une page de l'application",
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
 * All available tools
 */
export const llmTools: LLMTool[] = [
  // Query tools
  findEntities,
  getEntity,
  searchInCatalog,

  // Analysis tools
  groupBy,
  getStatistics,

  // Navigation
  navigate,
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
