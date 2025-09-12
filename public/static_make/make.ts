import fs, { writeFileSync, createWriteStream } from "fs"
import http from "http"
import path from "path"
import { fileURLToPath } from "url"
import { chromium, type Browser, type Page } from "playwright"
import { SitemapStream, streamToPromise } from "sitemap"
import handler from "serve-handler"

interface Config {
  domain: string
  index_seo: boolean
  app_path: string
  out_dir: string
  db_meta_path: string
  port: number
  entities: string[]
  routes: string[]
}

let config: Config

const config_file = "./config.json"
const config_user_file = "../data/static_make_config.json"
const index_file = "./index.html"
const entry_point = "./index_static_make.html"

async function wait_until_ready(url: string, max_attempts = 30, delay_ms = 200) {
  for (let i = 0; i < max_attempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, delay_ms))
  }
  throw new Error(`Timeout: server not ready at ${url}`)
}

async function generate_sitemap(routes: string[], domain: string, change_frequency = "monthly") {
  function calculate_priority(url: string) {
    if (url === "") return 1.0
    const depth = url.split("/").filter(Boolean).length
    return Math.max(0.3, 1.0 - depth * 0.2)
  }
  const sitemap_stream = new SitemapStream({ hostname: domain })
  const write_stream = createWriteStream("sitemap.xml")
  sitemap_stream.pipe(write_stream)
  routes.forEach((route: string) => {
    sitemap_stream.write({
      url: `/${route}`,
      changefreq: change_frequency,
      priority: calculate_priority(route),
    })
  })
  streamToPromise(sitemap_stream)
  sitemap_stream.end()
  return new Promise<void>(resolve => {
    write_stream.on("finish", () => resolve())
  })
}

async function get_entities_routes(db_meta_path: string) {
  const routes: string[] = []
  for (const entity of config.entities) {
    const filePath = `${db_meta_path}/${entity}.json.js`
    const data = await fs.promises.readFile(filePath, "utf8")
    const index = data.indexOf("=")
    const jsonPart = index !== -1 ? data.substring(index + 1).trim() : ""
    let json = JSON.parse(jsonPart)

    if (json.length > 0 && Array.isArray(json[0])) {
      json = array_to_object(json)
    }

    for (const row of json) {
      routes.push(`${entity}/${row.id}`)
    }
  }
  return routes
}

async function get_db_meta_path(output_db: string) {
  const items = await fs.promises.readdir(output_db, { withFileTypes: true })
  const files = items.filter(
    item => item.isFile() && item.name.endsWith(".json.js")
  ).length
  if (files > 0) return output_db
  const folders = items.filter(item => item.isDirectory())
  if (folders.length !== 1) return output_db
  return (output_db = path.join(output_db, folders[0].name))
}

async function load_config(): Promise<Config | null> {
  try {
    const config_content = JSON.parse(
      await fs.promises.readFile(config_file, "utf-8")
    )
    if (fs.existsSync(config_user_file)) {
      const config_user = JSON.parse(
        await fs.promises.readFile(config_user_file, "utf-8")
      )
      for (const key in config_user) {
        config_content[key] = config_user[key]
      }
    }
    return config_content as Config
  } catch (error) {
    console.error("Failed to read or parse", config_file, error)
    return null
  }
}

async function create_index_file() {
  try {
    let index = await fs.promises.readFile(index_file, "utf8")
    index = index
      .toString()
      .replace(`<base href=""`, `<base href="/"`)
      .replace("<head>", `<head><meta app_mode="static" />`)
    if (config.index_seo) {
      index = index.replace(
        `<meta name="robots" content="noindex"`,
        `<meta name="robots" `
      )
    }
    await fs.promises.writeFile(entry_point, index)
  } catch (error) {
    console.error("Failed to read or parse", index_file, error)
    return null
  }
}

async function delete_index_file() {
  try {
    await fs.promises.unlink(entry_point)
  } catch (error) {
    console.error("Failed to delete", entry_point, error)
  }
}

function array_to_object(data: any[]) {
  data = data.map((row: any) => {
    return row.reduce((acc: any, item: any, index: number) => {
      const key = data[0][index]
      return { ...acc, [key]: item }
    }, {})
  })
  data.shift()
  return data
}

function start_server(entry_file: string, port = 3000) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      return handler(req, res, {
        public: ".",
        rewrites: [{ source: "**", destination: entry_file }],
      })
    })
    server.listen(port, async () => {
      console.log(`⚡ Static server on http://localhost:${port}`)
      resolve(server)
    })
  })
}

function stop_server(server: any) {
  return new Promise<void>((resolve, reject) => {
    server.close((err: any) => {
      if (err) {
        console.error("Failed to close server:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function init_page(browser: Browser) {
  const page_url = `http://localhost:${config.port}`
  await wait_until_ready(page_url)
  const page = await browser.newPage()
  page.setDefaultTimeout(10000)
  await page.goto(page_url)
  return page
}

async function capture_page(page: Page, route: string, level: number) {
  let output_path = route === "" ? "index.html" : `${route}.html`
  await page.evaluate((route: string) => {
    window.history.pushState({ path: route }, "", route)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, route)
  try {
    await page.waitForSelector(
      `#page_loaded_route_${route.replaceAll("/", "___")}`,
      { timeout: 10000, state: 'attached' }
    )
    
    const content = await page.content()
    writeFileSync(`./${config.out_dir}/${output_path}`, content)
    console.log(`create page: ${route || "index"}`)
  } catch (error) {
    let error_message =
      ((error as Error).message = `Failed to capture page : ${output_path}`)
    if (level > 1) error_message += ` (retry ${level})`
    console.error(error_message)
  }
}

async function generate_static_site(routes: string[], start_time: Date) {
  let server: any, browser: Browser | undefined
  await create_index_file()
  try {
    server = await start_server(entry_point, config.port)
  } catch (error) {
    console.error("Failed to start server", error)
    return
  }
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox']
    })
  } catch (error) {
    console.error("Failed to start browser", error)
    return
  }
  try {
    const page = await init_page(browser)
    for (const route of routes) {
      await capture_page(page, route, 1)
    }
  } catch (error) {
    console.error("Failed to process routes", error)
  } finally {
    const cleanupPromises = []
    if (browser) cleanupPromises.push(browser.close())
    if (server) cleanupPromises.push(stop_server(server))
    
    await Promise.all(cleanupPromises)
    await delete_index_file()
    const time_taken = ((+new Date() - +start_time) / 1000).toFixed(2)
    console.log(
      `Static site created ${routes.length} pages in ${time_taken} seconds`
    )

    if (config.index_seo) {
      await generate_sitemap(routes, config.domain)
      console.log("Sitemap has been successfully created!")
    }
  }
}

process.chdir(path.dirname(fileURLToPath(import.meta.url)))
const start_time = new Date()
const loadedConfig = await load_config()

if (!loadedConfig) {
  console.error("Failed to load configuration")
  process.exit(1)
}

config = loadedConfig
const routes = config.routes

process.chdir(path.join(process.cwd(), config.app_path))

await fs.promises.rm(config.out_dir, { recursive: true, force: true })
await fs.promises.mkdir(config.out_dir, { recursive: true })
for (const entity of config.entities) {
  await fs.promises.mkdir(path.join(config.out_dir, entity), {
    recursive: true,
  })
}

const db_meta_path = await get_db_meta_path(config.db_meta_path)
const new_routes = await get_entities_routes(db_meta_path)
routes.push(...new_routes)

await generate_static_site(routes, start_time)
