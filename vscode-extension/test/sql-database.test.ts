import { describe, it, expect, beforeAll } from 'vitest'
import { SqlDatabase } from '../src/sql-database'
import * as path from 'path'

function parseResult(result: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(result)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid JSON result')
  }
  return parsed as Record<string, unknown>
}

describe('SqlDatabase', () => {
  let db: SqlDatabase | null = null

  beforeAll(async () => {
    const dbPath = path.join(__dirname, '..', '..', 'public', 'data', 'db')
    const schemasPath = path.join(__dirname, '..', '..', 'public', 'schemas')
    db = new SqlDatabase(dbPath, schemasPath)
    await db.initialize()
  })

  describe('executeQuery', () => {
    it('should return valid JSON with rows and count', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery('SELECT * FROM dataset LIMIT 1')
      const parsed = parseResult(result)

      expect(parsed).toHaveProperty('rows')
      expect(parsed).toHaveProperty('count')
      expect(Array.isArray(parsed.rows)).toBe(true)
    })

    it('should block DELETE operations', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery('DELETE FROM dataset')
      const parsed = parseResult(result)

      expect(parsed.error).toBeDefined()
      expect(
        typeof parsed.error === 'string' && parsed.error.includes('Forbidden'),
      ).toBe(true)
    })

    it('should block INSERT operations', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery('INSERT INTO dataset VALUES (1, "test")')
      const parsed = parseResult(result)

      expect(parsed.error).toBeDefined()
      expect(
        typeof parsed.error === 'string' && parsed.error.includes('Forbidden'),
      ).toBe(true)
    })

    it('should block UPDATE operations', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery('UPDATE dataset SET name = "test"')
      const parsed = parseResult(result)

      expect(parsed.error).toBeDefined()
      expect(
        typeof parsed.error === 'string' && parsed.error.includes('Forbidden'),
      ).toBe(true)
    })

    it('should block DROP operations', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery('DROP TABLE dataset')
      const parsed = parseResult(result)

      expect(parsed.error).toBeDefined()
      expect(
        typeof parsed.error === 'string' && parsed.error.includes('Forbidden'),
      ).toBe(true)
    })

    it('should return empty rows for query with no results', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery(
        'SELECT * FROM dataset WHERE id = 999999999',
      )
      const parsed = parseResult(result)

      expect(Array.isArray(parsed.rows) && parsed.rows.length === 0).toBe(true)
      expect(parsed.count).toBe(0)
    })

    it('should handle invalid SQL syntax', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery('INVALID SQL QUERY')
      const parsed = parseResult(result)

      expect(parsed.error).toBeDefined()
    })

    it('should execute COUNT queries', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.executeQuery('SELECT COUNT(*) as total FROM dataset')
      const parsed = parseResult(result)

      expect(parsed.rows).toBeDefined()
      expect(Array.isArray(parsed.rows) && parsed.rows.length > 0).toBe(true)
    })
  })

  describe('search', () => {
    it('should return valid JSON', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.search('test')
      const parsed = parseResult(result)

      expect(typeof parsed).toBe('object')
    })

    it('should return message when no results found', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.search('xyznonexistentterm12345')
      const parsed = parseResult(result)

      expect(parsed.message).toBeDefined()
      expect(
        typeof parsed.message === 'string' &&
          parsed.message.includes('No results found'),
      ).toBe(true)
    })

    it('should search across multiple tables', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.search('data')
      const parsed = parseResult(result)

      const tableKeys = Object.keys(parsed).filter(k => k !== 'message')
      expect(tableKeys.length).toBeGreaterThan(0)
    })

    it('should handle special characters safely', () => {
      if (!db) throw new Error('Database not initialized')
      const result = db.search("test'ing")
      const parsed = parseResult(result)

      expect(parsed).toBeDefined()
    })
  })

  describe('getSqlSchema', () => {
    it('should return schema information', () => {
      if (!db) throw new Error('Database not initialized')
      const schema = db.getSqlSchema()

      expect(schema).toBeDefined()
      expect(schema.length).toBeGreaterThan(0)
      expect(schema).toContain('TABLE:')
    })

    it('should include table descriptions', () => {
      if (!db) throw new Error('Database not initialized')
      const schema = db.getSqlSchema()

      expect(schema).toContain('Description:')
    })

    it('should include row counts', () => {
      if (!db) throw new Error('Database not initialized')
      const schema = db.getSqlSchema()

      expect(schema).toContain('Rows:')
    })

    it('should include column information', () => {
      if (!db) throw new Error('Database not initialized')
      const schema = db.getSqlSchema()

      expect(schema).toContain('Columns:')
    })
  })
})
