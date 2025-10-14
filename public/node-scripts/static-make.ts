import fs, { writeFileSync, createWriteStream } from 'fs'
import http from 'http'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { chromium, type Browser, type Page } from 'playwright'
import { SitemapStream, streamToPromise } from 'sitemap'
import handler from 'serve-handler'

type Row = Record<string, unknown>

interface Config {
  domain: string
  indexSeo: boolean
  appPath: string
  outDir: string
  dbMetaPath: string
  port: number
  entities: string[]
  routes: string[]
}

const configFile = './data/static-make.config.json'
const indexFile = './index.html'
const entryPoint = './index-static-make.html'

async function waitUntilReady(url: string, maxAttempts = 30, delayMs = 200) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // ignore errors
    }
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  throw new Error(`Timeout: server not ready at ${url}`)
}

async function generateSitemap(
  routes: string[],
  domain: string,
  changeFrequency = 'monthly',
) {
  function calculatePriority(url: string) {
    if (url === '') return 1.0
    const depth = url.split('/').filter(Boolean).length
    return Math.max(0.3, 1.0 - depth * 0.2)
  }
  const sitemapStream = new SitemapStream({ hostname: domain })
  const writeStream = createWriteStream('sitemap.xml')
  sitemapStream.pipe(writeStream)
  routes.forEach((route: string) => {
    sitemapStream.write({
      url: `/${route}`,
      changefreq: changeFrequency,
      priority: calculatePriority(route),
    })
  })
  streamToPromise(sitemapStream)
  sitemapStream.end()
  return new Promise<void>(resolve => {
    writeStream.on('finish', () => resolve())
  })
}

async function getEntitiesRoutes(dbMetaPath: string) {
  const routes: string[] = []
  for (const entity of config.entities) {
    const filePath = `${dbMetaPath}/${entity}.json.js`
    const data = await fs.promises.readFile(filePath, 'utf8')
    const index = data.indexOf('=')
    const jsonPart = index !== -1 ? data.substring(index + 1).trim() : ''
    let json = JSON.parse(jsonPart) as unknown[][] | Row[]

    if (json.length > 0 && Array.isArray(json[0])) {
      json = arrayToObject(json as unknown[][])
    }

    for (const row of json as Row[]) {
      routes.push(`${entity}/${row.id}`)
    }
  }
  return routes
}

async function getDbMetaPath(outputDb: string) {
  const items = await fs.promises.readdir(outputDb, { withFileTypes: true })
  const files = items.filter(
    item => item.isFile() && item.name.endsWith('.json.js'),
  ).length
  if (files > 0) return outputDb
  const folders = items.filter(item => item.isDirectory())
  if (folders.length !== 1) return outputDb
  return (outputDb = path.join(outputDb, folders[0].name))
}

async function loadConfig(): Promise<Config | null> {
  try {
    const rawConfig = JSON.parse(
      await fs.promises.readFile(configFile, 'utf-8'),
    ) as Config
    return rawConfig
  } catch (error) {
    console.error('Failed to read or parse', configFile, error)
    return null
  }
}

async function createIndexFile() {
  try {
    let index = await fs.promises.readFile(indexFile, 'utf8')
    index = index
      .toString()
      .replace(`<base href=""`, `<base href="/"`)
      .replace('<head>', `<head><meta app-mode="static" />`)
    if (config.indexSeo) {
      index = index.replace(
        `<meta name="robots" content="noindex"`,
        `<meta name="robots" `,
      )
    }
    await fs.promises.writeFile(entryPoint, index)
  } catch (error) {
    console.error('Failed to read or parse', indexFile, error)
  }
}

async function deleteIndexFile() {
  try {
    await fs.promises.unlink(entryPoint)
  } catch (error) {
    console.error('Failed to delete', entryPoint, error)
  }
}

function arrayToObject(data: unknown[][]): Row[] {
  const [headers, ...rows] = data
  const result: Row[] = []
  for (const row of rows) {
    const obj: Row = {}
    for (let i = 0; i < row.length; i++) {
      const key = headers[i] as string
      obj[key] = row[i]
    }
    result.push(obj)
  }
  return result
}

function startServer(entryFile: string, port = 3000): Promise<http.Server> {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      return handler(req, res, {
        public: '.',
        rewrites: [{ source: '**', destination: entryFile }],
      })
    })
    server.listen(port, async () => {
      console.log(`⚡ Static server on http://localhost:${port}`)
      resolve(server)
    })
  })
}

function stopServer(server: http.Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((err?: Error) => {
      if (err) {
        console.error('Failed to close server:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function initPage(browser: Browser) {
  const pageUrl = `http://localhost:${config.port}`
  await waitUntilReady(pageUrl)
  const page = await browser.newPage()
  page.setDefaultTimeout(10000)
  await page.goto(pageUrl)
  return page
}

async function capturePage(page: Page, route: string, level: number) {
  const outputPath = route === '' ? 'index.html' : `${route}.html`
  await page.evaluate((route: string) => {
    window.history.pushState({ path: route }, '', route)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, route)
  try {
    await page.waitForSelector(
      `#page-loaded-route-${route.replaceAll('/', '___')}`,
      { timeout: 10000, state: 'attached' },
    )

    const content = await page.content()
    writeFileSync(`./${config.outDir}/${outputPath}`, content)
    console.log(`create page: ${route || 'index'}`)
  } catch (error) {
    let errorMessage = ((error as Error).message =
      `Failed to capture page : ${outputPath}`)
    if (level > 1) errorMessage += ` (retry ${level})`
    console.error(errorMessage)
  }
}

async function generateStaticSite(routes: string[], startTime: Date) {
  let server: http.Server | undefined = undefined
  let browser: Browser | undefined = undefined
  await createIndexFile()
  try {
    server = await startServer(entryPoint, config.port)
  } catch (error) {
    console.error('Failed to start server', error)
    return
  }
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    })
  } catch (error) {
    console.error('Failed to start browser', error)
    return
  }
  try {
    const page = await initPage(browser)
    for (const route of routes) {
      await capturePage(page, route, 1)
    }
  } catch (error) {
    console.error('Failed to process routes', error)
  } finally {
    const cleanupPromises: Promise<void>[] = []
    if (browser) cleanupPromises.push(browser.close())
    if (server) cleanupPromises.push(stopServer(server))

    await Promise.all(cleanupPromises)
    await deleteIndexFile()
    const timeTaken = ((+new Date() - +startTime) / 1000).toFixed(2)
    console.log(
      `Static site created ${routes.length} pages in ${timeTaken} seconds`,
    )

    if (config.indexSeo) {
      await generateSitemap(routes, config.domain)
      console.log('Sitemap has been successfully created!')
    }
  }
}

const thisDirname = dirname(fileURLToPath(import.meta.url))
process.chdir(join(thisDirname, '..'))
const startTime = new Date()
const loadedConfig = await loadConfig()

if (!loadedConfig) {
  console.error('Failed to load configuration')
  process.exit(1)
}

const config: Config = loadedConfig
const routes = config.routes

process.chdir(path.join(process.cwd(), config.appPath))

await fs.promises.rm(config.outDir, { recursive: true, force: true })
await fs.promises.mkdir(config.outDir, { recursive: true })
for (const entity of config.entities) {
  await fs.promises.mkdir(path.join(config.outDir, entity), {
    recursive: true,
  })
}

const dbMetaPath = await getDbMetaPath(config.dbMetaPath)
const newRoutes = await getEntitiesRoutes(dbMetaPath)
routes.push(...newRoutes)

await generateStaticSite(routes, startTime)
