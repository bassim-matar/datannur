import path from "path"
import fs from "fs/promises"
import autoprefixer from "autoprefixer"
import alias from "@rollup/plugin-alias"
import FullReload from "vite-plugin-full-reload"
import { defineConfig } from "vitest/config"
import { visualizer } from "rollup-plugin-visualizer"
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { Jsonjsdb_watcher, jsonjsdb_add_config } from "jsonjsdb_editor"

const bundle_view = false

const out_dir = "app"
const mermaid_node_path = "node_modules/mermaid/dist/mermaid.min.js"
const mermaid_public_path = "public/assets/external/mermaid.min.js"
const flexsearch_node_path = "node_modules/flexsearch/dist/flexsearch.bundle.min.js"
const flexsearch_public_path = "public/assets/external/flexsearch.js"
const jsonjsdb_config = "public/data/jsonjsdb_config.html"
const app_version = JSON.parse(await fs.readFile("package.json", "utf8")).version

await Jsonjsdb_watcher.set_db("public/data/db")
await Jsonjsdb_watcher.watch("public/data/db_source")
await Jsonjsdb_watcher.update_preview("preview", "public/data/dataset")
await Jsonjsdb_watcher.update_md_files("md_doc", "public/data/md")

await fs.copyFile(mermaid_node_path, mermaid_public_path)
await fs.copyFile(flexsearch_node_path, flexsearch_public_path)

async function get_aliases(from) {
  const tsconfig = JSON.parse(await fs.readFile(from, "utf8")).compilerOptions
  const paths = tsconfig.paths as Record<string, string[]>
  return Object.fromEntries(
    Object.entries(paths).map(([find, [replacement]]) => [
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

function after_build(callback) {
  return { name: "after_build", apply: "build" as const, closeBundle: callback }
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
        const route_name =
          module_name.charAt(0).toLowerCase() + module_name.slice(1)
        let param: string | false = false
        if (filename.includes("["))
          param = `"${filename.split("[")[1].split("]")[0]}"`
        const module_path = `${page_dir_from_router_index}/${filename}.svelte`
        imports += `import ${module_name} from "${module_path}"\n`
        content += `\n  ${route_name}: { component: ${module_name}, param: ${param} },`
      }
      content += "\n}\n"
      await fs.writeFile(file, imports + content, "utf8")
    },
  }
}

export default defineConfig({
  base: "",
  server: { port: 8080, origin: "", open: true },
  test: { include: ["test/**/*.test.js"] },
  css: {
    postcss: {
      plugins: [autoprefixer]
    },
    preprocessorOptions: {
      scss: {
        loadPaths: ["src"]
      }
    }
  },
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
    FullReload(Jsonjsdb_watcher.get_table_index_file_path()),
    jsonjsdb_add_config(jsonjsdb_config) as any,
    update_router_index("src/.generated/router_index.js", "../page"),
    alias({ entries: await get_aliases("tsconfig.json") }),
    svelte({
      preprocess: vitePreprocess(),
    }),
    html_replace([
      ["{{app_version}}", app_version],
      [" crossorigin ", " "],
      [` type="module" src="./`, ` defer src="./`],
    ]),
    after_build(async () => {
      await fs.copyFile("LICENSE.md", out_dir + "/LICENSE.md")
      await fs.copyFile("CHANGELOG.md", out_dir + "/CHANGELOG.md")
    }),
  ],
})
