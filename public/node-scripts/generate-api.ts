import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { createHash } from 'crypto'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { formatWithPrettier } from './util.ts'

export type JsonSchema = {
  $id?: string
  $schema?: string
  title?: string
  description?: string
  type?: string
  items?: JsonSchema
  properties?: Record<string, JsonSchema>
  required?: string[]
  [key: string]: unknown
}

export type OpenAPISchema = {
  openapi: string
  info: {
    title: string
    description: string
    version: string
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

export type ApiConfig = {
  dataUrl: string
  basePath: string
  version: string
  schemasHash: string
  openApiVersion: string
  contact: {
    name: string
    url: string
  }
  license: {
    name: string
    url: string
  }
}

export type ApiSpec = {
  schemas: Record<string, JsonSchema>
  paths: Record<string, unknown>
  tags: Array<{ name: string; description: string }>
}

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const schemasDir = join(publicDir, 'schemas')
const apiDir = join(publicDir, 'api')
const configFile = join(apiDir, 'config.json')
const ignoreFiles = ['__meta__.schema.json', '__table__.schema.json']

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

async function getTableSchemas(schemasDir: string, ignoreFiles: string[]) {
  const files = await readdir(schemasDir)
  return files
    .filter(
      file => file.endsWith('.schema.json') && !ignoreFiles.includes(file),
    )
    .map(file => file.replace('.schema.json', ''))
    .sort()
}

function generateApiDocsHTML(
  version: string,
  title: string,
  specUrl: string,
): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url="${specUrl}?v=${version}"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
`
}

async function getApiConfig(schemas: Record<string, JsonSchema>) {
  const config = (await JSON.parse(
    await readFile(configFile, 'utf-8'),
  )) as ApiConfig

  const schemasJson = JSON.stringify(schemas)
  const hash = createHash('sha256').update(schemasJson).digest('hex')
  const currentHash = hash.substring(0, 8)

  let version = config.version
  const existingHash = config.schemasHash

  if (existingHash !== currentHash) {
    const [major, minor, patch] = version.split('.').map(Number)
    version = `${major}.${minor}.${patch + 1}`
    console.log(
      `📋 Schema changes detected (${existingHash} → ${currentHash}), bumping version to ${version}`,
    )
    const configContent = { ...config, version, schemasHash: currentHash }
    await writeFile(configFile, JSON.stringify(configContent, null, 2), 'utf-8')
  } else {
    console.log(`📋 No schema changes detected, keeping version ${version}`)
  }

  return {
    version,
    openApiVersion: config.openApiVersion,
    contact: config.contact,
    license: config.license,
    dataUrl: config.dataUrl,
    basePath: config.basePath,
  }
}

async function buildRawApiSpec(
  schemas: Record<string, JsonSchema>,
): Promise<ApiSpec> {
  const paths: Record<string, unknown> = {}
  const tags: Array<{ name: string; description: string }> = []

  for (const [tableName, schema] of Object.entries(schemas)) {
    const schemaName = schema.title ?? tableName
    const description = schema.description ?? `${tableName} table`

    tags.push({ name: tableName, description })

    paths[`/${tableName}.json`] = {
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
                schema: { $ref: `#/components/schemas/${schemaName}` },
              },
            },
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          404: { description: 'Table not found' },
        },
      },
    }
  }

  return { schemas, paths, tags }
}

async function saveOpenAPISpec(
  spec: ApiSpec,
  config: {
    version: string
    openApiVersion: string
    contact: ApiConfig['contact']
    license: ApiConfig['license']
    serverUrl: string
    title: string
    description: string
    outputFileName: string
    docsFileName: string
    docsTitle: string
  },
) {
  const outputFile = join(apiDir, config.outputFileName)

  const openapi: OpenAPISchema = {
    openapi: config.openApiVersion,
    info: {
      title: config.title,
      description: config.description,
      version: config.version,
      contact: config.contact,
      license: config.license,
    },
    servers: [{ url: config.serverUrl, description: 'API Server' }],
    paths: spec.paths,
    components: { schemas: spec.schemas },
    tags: spec.tags,
  }

  await writeFile(outputFile, JSON.stringify(openapi, null, 2), 'utf-8')

  console.log(`✅ OpenAPI specification generated: ${outputFile}`)
  console.log(`📊 Tables: ${Object.keys(spec.schemas).length}`)
  console.log(`🔖 Version: ${config.version}`)

  const apiDocsContent = generateApiDocsHTML(
    config.version,
    config.docsTitle,
    `./${config.outputFileName}`,
  )
  const apiDocsPath = join(apiDir, config.docsFileName)
  await writeFile(apiDocsPath, apiDocsContent, 'utf-8')
  console.log(`✅ Generated ${config.docsFileName}`)

  formatWithPrettier(outputFile)
}

async function generateRawAPI(
  version: string,
  openApiVersion: string,
  contact: ApiConfig['contact'],
  license: ApiConfig['license'],
  dataUrl: string,
  schemas: Record<string, JsonSchema>,
) {
  console.log('\n🔄 Generating Raw API documentation...')

  const spec = await buildRawApiSpec(schemas)

  await saveOpenAPISpec(spec, {
    version,
    openApiVersion,
    contact,
    license,
    serverUrl: dataUrl,
    title: 'datannur Raw API',
    description:
      'Read-only REST API providing direct access to datannur database JSON files. Each endpoint returns a complete table as a JSON array. This is a static file-based API with no server-side processing.',
    outputFileName: 'openapi-raw.json',
    docsFileName: 'api-docs-raw.html',
    docsTitle: 'datannur Raw API Documentation',
  })
}

async function buildRestfulApiSpec(
  schemas: Record<string, JsonSchema>,
): Promise<ApiSpec> {
  const apiSchemas: Record<string, JsonSchema> = {}
  const paths: Record<string, unknown> = {}
  const tags: Array<{ name: string; description: string }> = []

  for (const [tableName, schema] of Object.entries(schemas)) {
    const schemaName = schema.title ?? tableName
    const description = schema.description ?? `${tableName} table`

    apiSchemas[schemaName] =
      schema.type === 'array' && schema.items ? schema.items : schema

    tags.push({ name: tableName, description })

    paths[`/${tableName}`] = {
      get: {
        summary: `Get all ${tableName} records`,
        description: `Returns all records from the ${tableName} table with optional filtering, pagination, and sorting`,
        tags: [tableName],
        parameters: [
          {
            name: '_limit',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Limit number of results',
          },
          {
            name: '_offset',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Offset for pagination',
          },
          {
            name: '_sort',
            in: 'query',
            schema: { type: 'string' },
            description: 'Field to sort by',
          },
          {
            name: '_order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'] },
            description: 'Sort order (asc or desc)',
          },
        ],
        responses: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          200: {
            description: 'Successful response',
            content: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: `#/components/schemas/${schemaName}` },
                },
              },
            },
          },
        },
      },
    }

    paths[`/${tableName}/{id}`] = {
      get: {
        summary: `Get ${tableName} by ID`,
        description: `Returns a single record from the ${tableName} table by its ID`,
        tags: [tableName],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Record ID',
          },
        ],
        responses: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          200: {
            description: 'Successful response',
            content: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` },
              },
            },
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          404: { description: 'Record not found' },
        },
      },
    }
  }

  return { schemas: apiSchemas, paths, tags }
}

async function generateRestfulAPI(
  version: string,
  openApiVersion: string,
  contact: ApiConfig['contact'],
  license: ApiConfig['license'],
  basePath: string,
  schemas: Record<string, JsonSchema>,
) {
  console.log('\n🔄 Generating RESTful API documentation...')

  const spec = await buildRestfulApiSpec(schemas)

  await saveOpenAPISpec(spec, {
    version,
    openApiVersion,
    contact,
    license,
    serverUrl: basePath,
    title: 'datannur API',
    description:
      'RESTful API for the datannur data catalog. Provides read-only access to database tables with filtering, pagination, and sorting capabilities.',
    outputFileName: 'openapi.json',
    docsFileName: 'api-docs.html',
    docsTitle: 'datannur API Documentation',
  })
}

async function generateAPI(): Promise<void> {
  console.log('🚀 Generating API documentation...')

  await mkdir(apiDir, { recursive: true })

  const schemaFiles = await getTableSchemas(schemasDir, ignoreFiles)
  const schemas: Record<string, JsonSchema> = {}
  for (const tableName of schemaFiles) {
    const filePath = join(schemasDir, `${tableName}.schema.json`)
    const schema = JSON.parse(await readFile(filePath, 'utf-8')) as JsonSchema
    schemas[tableName] = convertJsonSchemaToOpenAPI(schema)
  }

  const { version, openApiVersion, contact, license, dataUrl, basePath } =
    await getApiConfig(schemas)

  await Promise.all([
    generateRawAPI(version, openApiVersion, contact, license, dataUrl, schemas),
    generateRestfulAPI(
      version,
      openApiVersion,
      contact,
      license,
      basePath,
      schemas,
    ),
  ])

  console.log('\n✅ API documentation generation complete!')
}

generateAPI().catch(error => {
  console.error('❌ Error generating API documentation:', error)
  process.exit(1)
})
