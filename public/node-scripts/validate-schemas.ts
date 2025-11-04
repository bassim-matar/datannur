import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true, strict: false })

const scriptDir = dirname(fileURLToPath(import.meta.url))
const publicDir = dirname(scriptDir)

const packageJson = JSON.parse(
  readFileSync(join(publicDir, 'package.json'), 'utf-8'),
) as { datannur: { dbPath: string; schemasPath: string } }
const dbPath = packageJson.datannur.dbPath
const schemasPath = packageJson.datannur.schemasPath

const schemasDir = join(publicDir, schemasPath)
const dataDir = join(publicDir, dbPath)

// Get data schemas (root level)
const dataSchemaFiles = readdirSync(schemasDir)
  .filter(f => f.endsWith('.schema.json') && !f.startsWith('__'))
  .map(f => ({ file: f, dir: schemasDir, type: 'data' }))

// Get userData schemas (userData subdirectory)
const userDataDir = join(schemasDir, 'userData')
const userDataSchemaFiles = existsSync(userDataDir)
  ? readdirSync(userDataDir)
      .filter(f => f.endsWith('.schema.json'))
      .map(f => ({ file: f, dir: userDataDir, type: 'userData' }))
  : []

const schemaFiles = [...dataSchemaFiles, ...userDataSchemaFiles]

// Load meta-schema
const metaSchemaPath = join(schemasDir, '__meta__.schema.json')
const metaSchema = JSON.parse(
  readFileSync(metaSchemaPath, 'utf-8'),
) as JsonObject
ajv.addMetaSchema(metaSchema, './__meta__.schema.json')
ajv.addMetaSchema(metaSchema, '../__meta__.schema.json') // For userData schemas
const metaValidate = ajv.compile(metaSchema)

let errors = 0

console.log('📋 Validating schemas...')
for (const { file, dir } of schemaFiles) {
  const schema = JSON.parse(
    readFileSync(join(dir, file), 'utf-8'),
  ) as JsonObject

  // Validate against our custom meta-schema
  if (!metaValidate(schema)) {
    console.log(`❌ ${file} (meta-schema):`)
    console.log(ajv.errorsText(metaValidate.errors))
    errors++
    continue
  }

  ajv.addSchema(schema, file.replace('.schema.json', ''))
}

if (errors > 0) {
  console.log(`\n❌ ${errors} schema(s) invalid\n`)
  process.exit(1)
}

console.log(`✅ ${schemaFiles.length} schemas valid\n`)

console.log('🔍 Validating data files...')
let totalItems = 0

for (const { file, type } of schemaFiles) {
  const entityName = file.replace('.schema.json', '')
  const dataFile = join(dataDir, `${entityName}.json`)

  if (type === 'userData') continue

  try {
    const data: unknown = JSON.parse(readFileSync(dataFile, 'utf-8'))
    const validate = ajv.getSchema(entityName)

    if (!validate || !validate(data)) {
      console.log(`❌ ${entityName}.json:`)
      console.log(ajv.errorsText(validate?.errors, { dataVar: entityName }))
      errors++
    } else if (Array.isArray(data)) {
      totalItems += data.length
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.log(`❌ ${entityName}.json:`, (error as Error).message)
      errors++
    }
  }
}

if (errors > 0) {
  console.log(`\n❌ Validation failed\n`)
  process.exit(1)
}

console.log(`✅ ${totalItems} items validated`)
process.exit(0)
