import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import path from "path"
import { pathToFileURL, fileURLToPath } from "url"

const this_folder = path.dirname(fileURLToPath(import.meta.url))
let base_url = pathToFileURL(path.resolve(this_folder, "..")).href
base_url += "/app/index.html"

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await chromium.launch({ headless: true })
  page = await browser.newPage()
})

afterAll(async () => {
  await browser.close()
})

const page_names = [
  "",
  "institutions",
  "folders",
  "tags",
  "datasets",
  "variables",
  "modalities",
  "favorite",
  "options",
  "about",
  "search/?search=folder",
  "meta",
  "metaFolder/data",
  "metaDataset/institution",
  "institution/dff",
  "institution/vd-ojv",
  "folder/bevnat",
  "folder/04-economie",
  "tag/population",
  "dataset/accident_route",
  "dataset/dep_sante",
  "variable/dep_sante___variable_4",
  "variable/ser_pub_loc___variable_3",
  "modality/canton_sigle",
]

describe("UI tests", () => {
  page_names.forEach(page_name => {
    it(`should display the main section for page: ${page_name}`, async () => {
      await page.goto(`${base_url}#/${page_name}`)
      const section = await page.waitForSelector("div#wrapper > section.section")
      expect(section).toBeTruthy()
    })
  })
})
