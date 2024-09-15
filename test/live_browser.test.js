import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import path from "path"
import { pathToFileURL, fileURLToPath } from "url"
import puppeteer from "puppeteer"

const this_folder = path.dirname(fileURLToPath(import.meta.url))
let base_url = pathToFileURL(path.resolve(this_folder, "..")).href
base_url += "/app/index.html"

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({ headless: "new" })
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
  "institution/institution_1",
  "institution/institution_2",
  "folder/folder_1",
  "folder/folder_2",
  "tag/tag_1",
  "dataset/dataset_1",
  "dataset/dataset_2",
  "variable/dataset_1___variable_1",
  "variable/dataset_2___variable_2",
  "modality/modality_1",
]

describe("UI tests", () => {
  page_names.forEach(page_name => {
    it(`should display the main section for page: ${page_name}`, async () => {
      await page.goto(`${base_url}#/${page_name}`)
      const section = await page.waitForSelector(
        "div#wrapper > section.section"
      )
      expect(section).toBeTruthy()
    })
  })
})
