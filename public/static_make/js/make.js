import fs, { writeFileSync, createWriteStream } from "fs"
import http from "http"
import path from "path"
import { parse, fileURLToPath } from "url"
import { resolve, sep } from "path"
import puppeteer from "puppeteer"
import { SitemapStream, streamToPromise } from "sitemap"

const config_file = "../config.json"
const config_user_file = "../../data/static_make_config.json"
const index_file = "./index.html"
const entry_point = "./index_static_make.html"

async function generate_sitemap(routes, domain, change_frequency = "monthly") {
  function calculate_priority(url) {
    if (url === "") return 1.0
    const depth = url.split("/").filter(Boolean).length
    return Math.max(0.3, 1.0 - depth * 0.2)
  }
  const sitemap_stream = new SitemapStream({ hostname: domain })
  const write_stream = createWriteStream("sitemap.xml")
  sitemap_stream.pipe(write_stream)
  routes.forEach(route => {
    sitemap_stream.write({
      url: `/${route}`,
      changefreq: change_frequency,
      priority: calculate_priority(route),
    })
  })
  streamToPromise(sitemap_stream)
  sitemap_stream.end()
  return new Promise(resolve => {
    write_stream.on("finish", () => resolve())
  })
}

async function get_entities_routes(db_meta_path) {
  const routes = []
  for (const entity of config.entities) {
    const filePath = `${db_meta_path}/${entity}.json.js`
    const data = await fs.promises.readFile(filePath, "utf8")
    const index = data.indexOf("=")
    const jsonPart = index !== -1 ? data.substring(index + 1).trim() : ""
    let json = JSON.parse(jsonPart)

    if (json.length > 0 && Array.isArray(json[0])) {
      json = array_to_object(json)
    }

    json.forEach(row => {
      routes.push(`${entity}/${row.id}`)
    })
  }
  return routes
}

async function get_db_meta_path(output_db) {
  const items = await fs.promises.readdir(output_db, { withFileTypes: true })
  const files = items.filter(
    item => item.isFile() && item.name.endsWith(".json.js")
  ).length
  if (files > 0) return output_db
  const folders = items.filter(item => item.isDirectory())
  if (folders.length !== 1) return output_db
  return (output_db = path.join(output_db, folders[0].name))
}

async function load_config() {
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
    return config_content
  } catch (error) {
    console.error("Failed to read or parse", file, error)
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
      index = index.replace(`<meta name="robots" content="noindex"`, `<meta name="robots" `)
    }
    await fs.promises.writeFile(entry_point, index)
  } catch (error) {
    console.error("Failed to read or parse", file, error)
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

function array_to_object(data) {
  data = data.map(row => {
    return row.reduce((acc, item, index) => {
      const key = data[0][index]
      return { ...acc, [key]: item }
    }, {})
  })
  data.shift()
  return data
}

async function waitForTimeout(page, timeout) {
  await page.evaluate(timeout => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout)
    })
  }, timeout)
}

async function fileExists(path) {
  try {
    const stats = await fs.promises.stat(path)
    return stats.isFile()
  } catch (e) {
    return false
  }
}

const start_server = async (index_file, port) => {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = http.createServer(async (req, res) => {
      if (req.method !== "GET") {
        res.writeHead(405, { "Content-Type": "text/plain" })
        res.end("Method Not Allowed")
        return
      }

      const { pathname } = parse(req.url)
      const sanitizedPath = pathname
        .replace(/^(\.)+/, "")
        .split("/")
        .join(sep)
      const path = resolve(`${process.cwd()}${sanitizedPath}`)

      try {
        if (await fileExists(path)) {
          res.writeHead(200, { "Content-Type": "text/html" })
          fs.createReadStream(path).pipe(res)
          return
        }
        res.writeHead(200, { "Content-Type": "text/html" })
        fs.createReadStream(index_file).pipe(res)
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" })
        res.end("Internal Server Error")
        rejectPromise(error)
      }
    })

    server.listen(port, "localhost", async () => {
      console.log(`Server running at http://localhost:${port}/`)
      await new Promise(resolve => setTimeout(resolve, config.wait_load * 1000))
      resolvePromise(server)
    })
  })
}

function stop_server(server) {
  return new Promise((resolve, reject) => {
    server.close(err => {
      if (err) {
        console.error("Failed to close server:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function init_page(browser) {
  const page_url = `http://localhost:${config.port}`
  const page = await browser.newPage()
  page.setDefaultTimeout(600000)
  await page.goto(page_url, { waitUntil: "networkidle0" })
  await waitForTimeout(page, config.wait_load * 1000)
  return page
}

async function capture_page(page, route, level) {
  let output_path = route === "" ? "index.html" : `${route}.html`
  await page.evaluate(route => {
    window.history.pushState({ path: route }, "", route)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, route)
  try {
    await page.waitForSelector(
      `#page_loaded_route_${route.replaceAll("/", "___")}`,
      { timeout: 10000 }
    )
    const content = await page.content()
    writeFileSync(`./${config.out_dir}/${output_path}`, content)
    console.log(`create page: ${route || "index"}`)
  } catch (error) {
    let error_message =
      (error.message = `Failed to capture page : ${output_path}`)
    if (level > 1) error_message += ` (retry ${level})`
    console.error(error_message)
  }
}

async function process_batch(browser, batch) {
  const page = await init_page(browser)
  for (const route of batch) {
    await capture_page(page, route, 1)
  }
}

async function generate_static_site(routes) {
  let server, browser
  await create_index_file()
  try {
    server = await start_server(entry_point, config.port)
  } catch (error) {
    console.error("Failed to start server", error)
    return
  }
  try {
    browser = await puppeteer.launch()
  } catch (error) {
    console.error("Failed to start browser", error)
    return
  }
  try {
    const batches = []
    const batch_size = Math.ceil(routes.length / config.concurrency)
    for (let i = 0; i < routes.length; i += batch_size) {
      const batch = routes.slice(i, i + batch_size)
      batches.push(batch)
    }
    await Promise.all(batches.map(batch => process_batch(browser, batch)))
  } catch (error) {
    console.error("Failed to process batch", error)
  } finally {
    await Promise.all([browser.close(), stop_server(server)])
    await delete_index_file()
    const time_taken = ((new Date() - start_time) / 1000).toFixed(2)
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
const config = await load_config()
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

await generate_static_site(routes)
