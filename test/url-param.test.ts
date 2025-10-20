import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

const baseUrl = new URL('../app/index.html', import.meta.url).href

let browser: Browser | undefined = undefined
let page: Page | undefined = undefined

beforeAll(async () => {
  browser = await chromium.launch({ headless: true })
  page = await browser.newPage()

  page.on('console', msg => {
    if (msg.type() === 'error') {
      throw new Error(`Console error: ${msg.text()}`)
    }
  })

  page.on('pageerror', error => {
    throw new Error(`Page error: ${error.message}`)
  })
})

afterAll(async () => {
  await browser?.close()
})

beforeEach(async () => {
  await page?.goto(baseUrl)
  await page?.waitForSelector('div#wrapper > section.section')
})

describe('UrlParam - URL behavior with hash routing', () => {
  it('should load page with hash URL parameter', async () => {
    await page?.goto(`${baseUrl}#/?test_param=value123`)
    await page?.waitForSelector('div#wrapper > section.section')

    const url = await page?.url()
    expect(url).toContain('test_param=value123')
  })

  it('should load page with query string parameter', async () => {
    await page?.goto(`${baseUrl}?test_param=value456`)
    await page?.waitForSelector('div#wrapper > section.section')

    const url = await page?.url()
    expect(url).toContain('test_param=value456')
  })

  it('should preserve hash route with parameters', async () => {
    await page?.goto(`${baseUrl}#/datasets?filter=test`)
    await page?.waitForSelector('div#wrapper > section.section')

    const url = await page?.url()
    expect(url).toContain('#/datasets')
    expect(url).toContain('filter=test')
  })

  it('should handle multiple URL parameters', async () => {
    await page?.goto(`${baseUrl}#/?param1=value1&param2=value2&param3=value3`)
    await page?.waitForSelector('div#wrapper > section.section')

    const url = await page?.url()
    expect(url).toContain('param1=value1')
    expect(url).toContain('param2=value2')
    expect(url).toContain('param3=value3')
  })

  it('should handle special characters in URL parameters', async () => {
    const testValue = encodeURIComponent('test value with spaces & symbols!')
    await page?.goto(`${baseUrl}#/?special=${testValue}`)
    await page?.waitForSelector('div#wrapper > section.section')

    const url = await page?.url()
    expect(url).toContain('special=')
  })

  it('should load different pages with hash routing', async () => {
    const pages = ['datasets', 'folders', 'tags', 'institutions']

    for (const pageName of pages) {
      await page?.goto(`${baseUrl}#/${pageName}`)
      await page?.waitForSelector('div#wrapper > section.section')

      const url = await page?.url()
      expect(url).toContain(`#/${pageName}`)
    }
  })

  it('should navigate to page with parameters', async () => {
    await page?.goto(`${baseUrl}#/datasets?search=test&sort=name`)
    await page?.waitForSelector('div#wrapper > section.section')

    const url = await page?.url()
    expect(url).toContain('#/datasets')
    expect(url).toContain('search=test')
    expect(url).toContain('sort=name')
  })
})

describe('UrlParam - localStorage integration', () => {
  it('should persist and retrieve data from localStorage', async () => {
    await page?.evaluate(() => {
      localStorage.setItem('test_key', 'test_value')
    })

    const value = await page?.evaluate(() => {
      return localStorage.getItem('test_key')
    })

    expect(value).toBe('test_value')
  })

  it('should clear localStorage', async () => {
    await page?.evaluate(() => {
      localStorage.setItem('test_key', 'test_value')
      localStorage.clear()
    })

    const value = await page?.evaluate(() => {
      return localStorage.getItem('test_key')
    })

    expect(value).toBeNull()
  })

  it('should remove specific localStorage item', async () => {
    await page?.evaluate(() => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')
      localStorage.removeItem('key1')
    })

    const values = await page?.evaluate(() => {
      return {
        key1: localStorage.getItem('key1'),
        key2: localStorage.getItem('key2'),
      }
    })

    expect(values?.key1).toBeNull()
    expect(values?.key2).toBe('value2')
  })

  it('should store and retrieve JSON data in localStorage', async () => {
    const testData = { name: 'Test', count: 42, active: true }

    await page?.evaluate(data => {
      localStorage.setItem('json_data', JSON.stringify(data))
    }, testData)

    const retrieved = await page?.evaluate(() => {
      const data = localStorage.getItem('json_data')
      return data ? (JSON.parse(data) as typeof testData) : null
    })

    expect(retrieved).toEqual(testData)
  })

  it('should handle localStorage with page navigation', async () => {
    await page?.evaluate(() => {
      localStorage.setItem('persistent_key', 'persistent_value')
    })

    await page?.goto(`${baseUrl}#/datasets`)
    await page?.waitForSelector('div#wrapper > section.section')

    const value = await page?.evaluate(() => {
      return localStorage.getItem('persistent_key')
    })

    expect(value).toBe('persistent_value')
  })

  it('should store multiple items in localStorage', async () => {
    const items = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    }

    await page?.evaluate(data => {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, value)
      })
    }, items)

    const retrieved = await page?.evaluate(() => {
      return {
        key1: localStorage.getItem('key1'),
        key2: localStorage.getItem('key2'),
        key3: localStorage.getItem('key3'),
      }
    })

    expect(retrieved).toEqual(items)
  })
})

describe('UrlParam - Static render mode detection', () => {
  it('should load page with app_mode parameter', async () => {
    await page?.goto(`${baseUrl}?app_mode=static_render`, {
      timeout: 10000,
    })

    const url = await page?.url()
    expect(url).toContain('app_mode=static_render')
  })

  it('should handle parameters in static mode', async () => {
    await page?.goto(
      `${baseUrl}?app_mode=static_render&test_param=static_value`,
      { timeout: 10000 },
    )

    const url = await page?.url()
    expect(url).toContain('app_mode=static_render')
    expect(url).toContain('test_param=static_value')
  })
})
