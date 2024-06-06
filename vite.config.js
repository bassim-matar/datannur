import path from "path"
import archiver from "archiver"
import autoprefixer from "autoprefixer"
import alias from "@rollup/plugin-alias"
import autoPreprocess from "svelte-preprocess"
import FullReload from "vite-plugin-full-reload"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { promises as fs, createWriteStream, existsSync } from "fs"
import { Jsonjsdb_watcher, jsonjsdb_add_config } from "jsonjsdb_editor"

const bundle_view = false
const include_bulma_css_lib = false

const out_dir = "app"
const mermaid_node_path = "node_modules/mermaid/dist/mermaid.min.js"
const mermeid_public_path = "public/assets/external/mermaid.min.js"
const bulma_css_path = "node_modules/bulma/css/bulma.css"
const jsonjsdb_config = "public/data/jsonjsdb_config.html"
const app_version = JSON.parse(await fs.readFile("package.json")).version
const db_path = "db"

await Jsonjsdb_watcher.set_db("public/data/db")
await Jsonjsdb_watcher.watch(db_path)
await Jsonjsdb_watcher.update_preview("preview", "public/data/dataset")

if (!existsSync(mermeid_public_path)) {
  await fs.copyFile(mermaid_node_path, mermeid_public_path)
}

async function get_aliases(from) {
  const jsconfig = JSON.parse(await fs.readFile(from)).compilerOptions
  return Object.fromEntries(
    Object.entries(jsconfig.paths).map(([find, [replacement]]) => [
      find.replace("/*", ""),
      path.resolve(replacement.replace("/*", "")),
    ])
  )
}

function html_replace(replacements) {
  return {
    name: `html_replace`,
    transformIndexHtml: {
      handler: html => {
        for (const replacement of replacements) {
          html = html.replaceAll(replacement[0], replacement[1])
        }
        return html
      },
    },
  }
}

function serve_html_transform(transform) {
  return {
    name: "serve_html_transform",
    apply: "serve",
    transformIndexHtml: { order: "post", handler: transform },
  }
}

function after_build(callback) {
  return { name: "after_build", apply: "build", closeBundle: callback }
}

async function create_zip(out_dir, zip_folder, zip_filename) {
  const base_path = path.resolve(".")
  zip_folder = path.join(base_path, zip_folder)
  await fs.mkdir(zip_folder, { recursive: true }).catch(console.error)
  const archive = archiver("zip", { zlib: { level: 9 } })
  archive.pipe(createWriteStream(path.join(zip_folder, zip_filename)))
  const add_files_to_archive = async dir => {
    for (const dirent of await fs.readdir(dir, { withFileTypes: true })) {
      const full_path = path.join(dir, dirent.name)
      if (full_path === zip_folder) continue
      if (dirent.isDirectory()) await add_files_to_archive(full_path)
      else if (dirent.name !== ".DS_Store") {
        archive.file(full_path, { name: path.relative(base_path, full_path) })
      }
    }
  }
  await add_files_to_archive(path.join(base_path, out_dir)).catch(console.error)
  archive.finalize()
}

function update_router_index(file, page_dir_from_router_index) {
  return {
    name: "update_router_index",
    async buildStart() {
      let imports = ""
      let content = `\nexport default {`
      const files = await fs.readdir("src/page")
      for (const file of files) {
        if (!file.endsWith(".svelte")) continue
        const filename = file.replace(".svelte", "")
        const module_name = filename.split("[")[0]
        let param = false
        if (filename.includes("["))
          param = `"${filename.split("[")[1].split("]")[0]}"`
        const module_path = `${page_dir_from_router_index}/${filename}.svelte`
        imports += `import ${module_name} from "${module_path}"\n`
        content += `\n  ${module_name}: { component: ${module_name}, param: ${param} },`
      }
      content += "\n}\n"
      await fs.writeFile(file, imports + content, "utf8")
    },
  }
}

export default defineConfig({
  base: "",
  server: { port: 8080, origin: "", open: true },
  build: {
    outDir: out_dir,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      plugins: [
        bundle_view && visualizer({ open: true, filename: "bundle_view.html" }),
      ],
    },
  },
  plugins: [
    FullReload(Jsonjsdb_watcher.get_db_meta_file_path()),
    jsonjsdb_add_config(jsonjsdb_config),
    update_router_index("src/.generated/router_index.js", "../page"),
    alias({ entries: await get_aliases("jsconfig.json") }),
    svelte({
      preprocess: autoPreprocess({ postcss: { plugins: [autoprefixer] } }),
    }),

    include_bulma_css_lib &&
      serve_html_transform(html => {
        return html.replace(
          "<head>",
          `<head><link rel="stylesheet" href="${bulma_css_path}" />`
        )
      }),

    html_replace([
      ["{{app_version}}", app_version],
      [" crossorigin ", " "],
      [` type="module" src="./`, ` defer src="./`],
    ]),

    after_build(async () => {
      await fs.copyFile("LICENSE.md", out_dir + "/LICENSE.md")
      await create_zip(out_dir, out_dir + "/zip", "datannuaire.zip")
      await create_zip(db_path, out_dir + "/zip", "datannuaire_db.zip")
    }),
  ],
})
