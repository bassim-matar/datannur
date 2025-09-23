import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

const baseUrl = new URL('../app/index.html', import.meta.url).href

let browser: Browser
let page: Page

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
  await browser.close()
})

const pageNames = [
  '',
  'institutions',
  'folders',
  'tags',
  'datasets',
  'variables',
  'modalities',
  'favorite',
  'options',
  'about',
  'search/?search=folder',
  'meta',
  'metaFolder/data',
  'metaDataset/institution',
  'institution/dff',
  'institution/vd-ojv',
  'folder/bevnat',
  'folder/04-economie',
  'tag/population',
  'dataset/accident_route',
  'dataset/dep_sante',
  'variable/dep_sante___variable_4',
  'variable/ser_pub_loc___variable_3',
  'modality/canton_sigle',
]

describe('UI tests', () => {
  pageNames.forEach(pageName => {
    it(`should display the main section for page: ${pageName}`, async () => {
      await page.goto(`${baseUrl}#/${pageName}`)
      const section = await page.waitForSelector(
        'div#wrapper > section.section',
      )
      expect(section).toBeTruthy()
    })
  })
})
