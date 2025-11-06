import * as fs from 'fs'
import * as path from 'path'
import initSqlJs from 'sql.js'
import type { Database } from 'sql.js'

interface TableInfo {
  name: string
  lastModif: number
}

interface TableSchema {
  title: string
  description: string
  descriptionFr?: string
  items: {
    required?: string[]
    properties: {
      [key: string]: { type: string | string[]; description: string }
    }
  }
}

interface DbRecord {
  [key: string]: unknown
}

export class SqlDatabase {
  private db: Database | null = null
  private schemas: { [tableName: string]: TableSchema } = {}
  private tableList: TableInfo[] = []

  constructor(
    private dbPath: string,
    private schemasPath: string,
  ) {}

  async initialize(): Promise<void> {
    console.log('🔄 Initializing SQL.js database...')

    // Load SQL.js
    const sqlJs = await initSqlJs({
      locateFile: (file: string) => {
        return path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
      },
    })

    this.db = new sqlJs.Database()
    console.log('✅ SQL.js loaded')

    // Load metadata
    this.loadMetadata()

    // Create tables and load data
    await this.createTablesAndLoadData()

    console.log('✅ SQL database ready')
  }

  private loadMetadata(): void {
    const tableListPath = path.join(this.dbPath, '__table__.json')
    if (fs.existsSync(tableListPath)) {
      try {
        const rawList = JSON.parse(fs.readFileSync(tableListPath, 'utf-8')) as {
          name: string
          last_modif: number // eslint-disable-line @typescript-eslint/naming-convention
        }[]
        this.tableList = rawList.map(t => ({
          name: t.name,
          lastModif: t.last_modif,
        }))
        console.log(`📋 Found ${this.tableList.length} tables`)
      } catch (error) {
        console.error('Failed to load __table__.json:', error)
      }
    }

    const schemaFiles = fs
      .readdirSync(this.schemasPath)
      .filter(f => f.endsWith('.schema.json') && !f.startsWith('__'))

    for (const file of schemaFiles) {
      const tableName = file.replace('.schema.json', '')
      const schemaPath = path.join(this.schemasPath, file)
      try {
        const rawSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8')) as {
          title: string
          description: string
          'x-description-fr'?: string // eslint-disable-line @typescript-eslint/naming-convention
          items: {
            required?: string[]
            properties: {
              [key: string]: {
                type: string | string[]
                description: string
              }
            }
          }
        }

        this.schemas[tableName] = {
          title: rawSchema.title,
          description: rawSchema.description,
          descriptionFr: rawSchema['x-description-fr'],
          items: {
            required: rawSchema.items.required,
            properties: rawSchema.items.properties,
          },
        }
      } catch (error) {
        console.error(`Failed to load schema ${file}:`, error)
      }
    }

    console.log(`📚 Loaded ${Object.keys(this.schemas).length} schemas`)
  }

  private async createTablesAndLoadData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    for (const tableName of Object.keys(this.schemas)) {
      const schema = this.schemas[tableName]
      const tablePath = path.join(this.dbPath, `${tableName}.json`)

      if (!fs.existsSync(tablePath)) {
        console.warn(`⚠️ Data file not found: ${tableName}.json`)
        continue
      }

      try {
        // Create table
        const columns = Object.entries(schema.items.properties).map(
          ([name, prop]) => {
            const type = this.getSqlType(prop.type)
            return `"${name}" ${type}`
          },
        )

        const createSql = `CREATE TABLE "${tableName}" (${columns.join(', ')})`
        this.db.run(createSql)
        console.log(`📊 Created table: ${tableName}`)

        // Load data
        const data = JSON.parse(
          fs.readFileSync(tablePath, 'utf-8'),
        ) as DbRecord[]

        if (data.length > 0) {
          const fields = Object.keys(schema.items.properties)
          const placeholders = fields.map(() => '?').join(', ')
          const insertSql = `INSERT INTO "${tableName}" (${fields.map(f => `"${f}"`).join(', ')}) VALUES (${placeholders})`

          const stmt = this.db.prepare(insertSql)
          data.forEach(record => {
            const values = fields.map(f => this.normalizeValue(record[f]))
            stmt.run(values)
          })
          stmt.free()

          console.log(`✅ Loaded ${data.length} records into ${tableName}`)
        }
      } catch (error) {
        console.error(`Failed to create/load table ${tableName}:`, error)
      }
    }
  }

  private getSqlType(jsonType: string | string[]): string {
    const type = Array.isArray(jsonType) ? jsonType[0] : jsonType

    switch (type) {
      case 'integer':
        return 'INTEGER'
      case 'number':
        return 'REAL'
      case 'boolean':
        return 'INTEGER'
      case 'string':
      default:
        return 'TEXT'
    }
  }

  private normalizeValue(value: unknown): string | number | null {
    if (value === null || value === undefined) {
      return null
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return value as string | number
  }

  getSchemaInfo(): string {
    const tables = Object.entries(this.schemas).map(([name, schema]) => ({
      table: name,
      description: schema.description,
      descriptionFr: schema.descriptionFr,
      columns: Object.entries(schema.items.properties).map(
        ([colName, prop]) => ({
          name: colName,
          type: prop.type,
          description: prop.description,
        }),
      ),
    }))

    return JSON.stringify(tables, null, 2)
  }

  getSqlSchema(): string {
    if (!this.db) return 'Database not initialized'

    try {
      // Get list of tables
      const tablesResult = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      )

      if (tablesResult.length === 0) return 'No tables found'

      const tableNames = tablesResult[0].values.map(row => row[0] as string)
      const schemaLines: string[] = []

      // For each table, build enriched schema
      tableNames.forEach(tableName => {
        const schema = this.schemas[tableName]
        if (!schema) {
          schemaLines.push(`TABLE: ${tableName} (no schema info)`)
          return
        }

        // Table header with description
        schemaLines.push(`TABLE: ${tableName}`)
        if (schema.description) {
          schemaLines.push(`Description: ${schema.description}`)
        }

        // Count rows in table
        try {
          const countResult = this.db!.exec(
            `SELECT COUNT(*) FROM "${tableName}"`,
          )
          if (countResult.length > 0) {
            const count = countResult[0].values[0][0]
            schemaLines.push(`Rows: ${count}`)
          }
        } catch {
          // Ignore count errors
        }

        // List columns with descriptions
        schemaLines.push('Columns:')
        Object.entries(schema.items.properties).forEach(([colName, colDef]) => {
          const typeStr = Array.isArray(colDef.type)
            ? colDef.type.join('|')
            : colDef.type
          const desc = colDef.description ? ` - ${colDef.description}` : ''
          schemaLines.push(`  - ${colName} (${typeStr})${desc}`)
        })

        schemaLines.push('') // Empty line between tables
      })

      return schemaLines.join('\n')
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  executeQuery(sql: string): string {
    if (!this.db) {
      return JSON.stringify({ error: 'Database not initialized' })
    }

    // Security check: block write operations
    const upperSql = sql.toUpperCase()
    const forbidden = [
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'ALTER',
      'CREATE',
      'PRAGMA',
    ]

    if (forbidden.some(cmd => upperSql.includes(cmd))) {
      return JSON.stringify({
        error: `Forbidden operation. Only SELECT queries are allowed.`,
      })
    }

    try {
      const results = this.db.exec(sql)

      if (results.length === 0) {
        return JSON.stringify({ rows: [], count: 0 })
      }

      const result = results[0]
      const rows = result.values.map(row => {
        const obj: { [key: string]: unknown } = {}
        result.columns.forEach((col, i) => {
          obj[col] = row[i]
        })
        return obj
      })

      return JSON.stringify(
        {
          columns: result.columns,
          rows,
          count: rows.length,
        },
        null,
        2,
      )
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  getStats(): string {
    if (!this.db) return JSON.stringify({ error: 'Database not initialized' })

    try {
      const result = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      )

      if (result.length === 0) {
        return JSON.stringify({ totalTables: 0, tables: {} })
      }

      const tables = result[0].values.map(row => row[0] as string)
      const stats: { [table: string]: number } = {}

      tables.forEach(table => {
        const countResult = this.db!.exec(`SELECT COUNT(*) FROM "${table}"`)
        if (countResult.length > 0) {
          stats[table] = countResult[0].values[0][0] as number
        }
      })

      return JSON.stringify(
        {
          totalTables: tables.length,
          recordCounts: stats,
          totalRecords: Object.values(stats).reduce((a, b) => a + b, 0),
        },
        null,
        2,
      )
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  search(query: string): string {
    if (!this.db) {
      return JSON.stringify({ error: 'Database not initialized' })
    }

    try {
      // Escape SQL special characters
      const escapedQuery = query.replace(/'/g, "''")

      // Create multiple variations to handle accented characters
      // Since SQLite LOWER() doesn't handle accents, we search for both cases
      const variations = [
        escapedQuery,
        escapedQuery.toLowerCase(),
        escapedQuery.toUpperCase(),
      ]

      const results: { [tableName: string]: unknown[] } = {}

      const tables = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table'",
      )

      if (tables.length === 0) {
        return JSON.stringify({ message: 'No tables found' })
      }

      tables[0].values.forEach(row => {
        const table = row[0] as string

        // Get all columns for this table
        const columnsResult = this.db!.exec(`PRAGMA table_info("${table}")`)
        if (columnsResult.length === 0) return

        const allColumns = columnsResult[0].values.map(col => col[1] as string)

        // Define searchable text columns for each table type
        const searchableColumns: { [key: string]: string[] } = {
          dataset: ['name', 'description'],
          variable: ['name', 'description', 'label'],
          folder: ['name', 'description'],
          tag: ['name', 'description'],
          doc: ['name', 'description'],
          institution: ['name', 'description'],
          modality: ['name', 'description'],
          freq: ['name', 'description'],
          evolution: ['name', 'description'],
          value: ['name', 'description', 'label'],
        }

        // Use specific searchable columns if defined, otherwise filter for likely text columns
        const columnsToSearch =
          searchableColumns[table] ??
          allColumns.filter(col =>
            ['name', 'description', 'label', 'title', 'comment'].some(textCol =>
              col.toLowerCase().includes(textCol),
            ),
          )

        // If no suitable columns found, skip this table
        if (columnsToSearch.length === 0) return

        // Build WHERE clause for text columns with multiple variations to handle accents
        // Since SQLite doesn't handle accented characters well, we search for all variations
        const conditions = columnsToSearch.flatMap(col =>
          variations.map(
            v => `CAST("${col}" AS TEXT) LIKE '%${v}%' COLLATE NOCASE`,
          ),
        )
        const whereConditions = conditions.join(' OR ')

        // Search in this table
        const searchSql = `SELECT * FROM "${table}" WHERE ${whereConditions} LIMIT 50`

        const searchResult = this.db!.exec(searchSql)
        if (searchResult.length > 0 && searchResult[0].values.length > 0) {
          const rows = searchResult[0].values.map(row => {
            const obj: { [key: string]: unknown } = {}
            searchResult[0].columns.forEach((col, idx) => {
              obj[col] = row[idx]
            })
            return obj
          })
          results[table] = rows
        }
      })

      if (Object.keys(results).length === 0) {
        return JSON.stringify({
          message: `No results found for query: "${query}"`,
        })
      }

      return JSON.stringify(results, null, 2)
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}
