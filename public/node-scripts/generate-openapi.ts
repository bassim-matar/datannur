import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatWithPrettier } from './util.ts'

const currentFilename = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilename)
const publicDir = join(currentDir, '..')

interface JsonSchema {
  $id?: string
  title?: string
  description?: string
  type?: string
  items?: JsonSchema
  properties?: Record<string, JsonSchema>
  required?: string[]
  [key: string]: unknown
}

interface OpenAPISchema {
  openapi: string
  info: {
    title: string
    description: string
    version: string
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'x-schemas-hash'?: string
    contact?: {
      name: string
      url: string
    }
    license: {
      name: string
      url: string
    }
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, unknown>
  components: {
    schemas: Record<string, JsonSchema>
  }
  tags: Array<{
    name: string
    description: string
  }>
}

const schemasDir = join(publicDir, 'schemas')
const outputFile = join(publicDir, 'openapi.json')
const baseUrl = '/data/db'

const ignoreFiles = ['__meta__.schema.json', '__table__.schema.json']

async function readJsonFile(filePath: string): Promise<JsonSchema> {
  const content = await readFile(filePath, 'utf-8')
  return JSON.parse(content) as JsonSchema
}

function convertJsonSchemaToOpenAPI(schema: JsonSchema): JsonSchema {
  const openApiSchema = { ...schema }

  delete openApiSchema.$schema
  delete openApiSchema.$id

  if (openApiSchema.items && typeof openApiSchema.items === 'object') {
    openApiSchema.items = convertJsonSchemaToOpenAPI(openApiSchema.items)
  }

  if (openApiSchema.properties) {
    for (const key in openApiSchema.properties) {
      openApiSchema.properties[key] = convertJsonSchemaToOpenAPI(
        openApiSchema.properties[key],
      )
    }
  }

  return openApiSchema
}

async function generateOpenAPI(): Promise<void> {
  console.log('🔄 Generating OpenAPI specification...')

  const metaSchemaPath = join(schemasDir, '__meta__.schema.json')
  const metaSchema = await readJsonFile(metaSchemaPath)

  if (!metaSchema.$id || typeof metaSchema.$id !== 'string') {
    throw new Error('Missing or invalid $id in __meta__.schema.json')
  }

  const match = metaSchema.$id.match(/^(https?:\/\/[^/]+)/)
  if (!match?.[1]) {
    throw new Error(`Cannot extract domain from $id: ${metaSchema.$id}`)
  }

  const productionUrl = match[1]

  const files = await readdir(schemasDir)
  const schemaFiles = files.filter(
    file => file.endsWith('.schema.json') && !ignoreFiles.includes(file),
  )

  const schemas: Record<string, JsonSchema> = {}
  const paths: Record<string, unknown> = {}
  const tags: Array<{ name: string; description: string }> = []

  for (const file of schemaFiles) {
    const tableName = file.replace('.schema.json', '')
    const filePath = join(schemasDir, file)
    const schema = await readJsonFile(filePath)

    const schemaName = schema.title ?? tableName
    schemas[schemaName] = convertJsonSchemaToOpenAPI(schema)

    const description = schema.description ?? `${tableName} table`

    tags.push({
      name: tableName,
      description,
    })

    paths[`${baseUrl}/${tableName}.json`] = {
      get: {
        summary: `Get all ${tableName}`,
        description: `Returns the complete ${tableName} table as a JSON array`,
        tags: [tableName],
        responses: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          200: {
            description: 'Successful response',
            content: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${schemaName}`,
                },
              },
            },
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          404: {
            description: 'Table not found',
          },
        },
      },
    }
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  const servers = [
    {
      url: productionUrl,
      description: 'Production server',
    },
  ]

  if (isDevelopment) {
    servers.push({
      url: 'http://localhost:8080',
      description: 'Development server',
    })
  }

  const schemasJson = JSON.stringify(schemas)
  const hash = createHash('sha256').update(schemasJson).digest('hex')
  const currentHash = hash.substring(0, 8)

  let existingOpenAPI: OpenAPISchema | null = null
  try {
    const existingContent = await readFile(outputFile, 'utf-8')
    existingOpenAPI = JSON.parse(existingContent) as OpenAPISchema
  } catch {
    // File doesn't exist yet
  }

  let version = '1.0.0'
  if (existingOpenAPI) {
    const existingHash = existingOpenAPI.info['x-schemas-hash']
    if (existingHash === currentHash) {
      version = existingOpenAPI.info.version
      console.log('📋 No schema changes detected, keeping version')
    } else if (existingHash) {
      const [major, minor, patch] = existingOpenAPI.info.version
        .split('.')
        .map(Number)
      version = `${major}.${minor}.${patch + 1}`
      console.log(
        `📋 Schema changes detected (${existingHash} → ${currentHash}), bumping version`,
      )
    } else {
      console.log(
        '📋 Existing file without hash, incrementing from current version',
      )
      const [major, minor, patch] = existingOpenAPI.info.version
        .split('.')
        .map(Number)
      version = `${major}.${minor}.${(patch ?? 0) + 1}`
    }
  } else {
    console.log('📋 First generation, using initial version')
  }

  const openapi: OpenAPISchema = {
    openapi: '3.1.0',
    info: {
      title: 'datannur API',
      description:
        'Read-only REST API providing access to datannur database tables. Each endpoint returns a complete table as a JSON array. This is a static file-based API with no server-side processing.',
      version,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'x-schemas-hash': currentHash,
      contact: {
        name: 'datannur',
        url: 'https://datannur.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers,
    paths,
    components: {
      schemas,
    },
    tags,
  }

  await writeFile(outputFile, JSON.stringify(openapi, null, 2), 'utf-8')

  console.log(`✅ OpenAPI specification generated: ${outputFile}`)
  console.log(`📊 Tables: ${schemaFiles.length}`)
  console.log(`🏷️  Schemas: ${Object.keys(schemas).length}`)
  console.log(`🔖 Version: ${version}`)

  const apiDocsPath = join(publicDir, 'api-docs.html')
  let apiDocsContent = await readFile(apiDocsPath, 'utf-8')
  apiDocsContent = apiDocsContent.replace(
    /spec-url="\.\/openapi\.json(?:\?v=[^"]*)?"/,
    `spec-url="./openapi.json?v=${version}"`,
  )
  await writeFile(apiDocsPath, apiDocsContent, 'utf-8')
  console.log(`✅ Updated api-docs.html with version: ${version}`)

  console.log('🎨 Formatting with Prettier...')
  formatWithPrettier(outputFile)
  console.log('✅ Formatting complete')
}

generateOpenAPI().catch(error => {
  console.error('❌ Error generating OpenAPI spec:', error)
  process.exit(1)
})
