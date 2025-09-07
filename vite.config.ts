import path from "path"
import fs from "fs/promises"
import autoprefixer from "autoprefixer"
import alias from "@rollup/plugin-alias"
import FullReload from "vite-plugin-full-reload"
import { defineConfig } from "vitest/config"
import { visualizer } from "rollup-plugin-visualizer"
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { Jsonjsdb_watcher, jsonjsdb_add_config } from "jsonjsdb_editor"

const CONFIG = {
  bundleView: process.env.BUNDLE_VIEW === "true" || false,
  outDir: "app",
  serverPort: 8080,
  chunkSizeLimit: 1000,
  paths: {
    routerIndex: "src/.generated/router_index.ts",
    pageDir: "src/page",
    mermaidNode: "node_modules/mermaid/dist/mermaid.min.js",
    mermaidPublic: "public/assets/external/mermaid.min.js",
    flexsearchNode: "node_modules/flexsearch/dist/flexsearch.bundle.min.js",
    flexsearchPublic: "public/assets/external/flexsearch.js",
    jsonjsdbConfig: "public/data/jsonjsdb_config.html",
    dbPath: "public/data/db",
    dbSourcePath: "public/data/db_source",
    previewPath: "public/data/dataset",
    mdPath: "public/data/md",
  },
} as const

interface TsConfig {
  compilerOptions: { paths: Record<string, string[]> }
}

async function get_aliases(from: string): Promise<Record<string, string>> {
  const {
    compilerOptions: { paths },
  } = JSON.parse(await fs.readFile(from, "utf8")) as TsConfig
  return Object.fromEntries(
    Object.entries(paths).map(([find, [replacement]]) => [
      find.replace("/*", ""),
      path.resolve(replacement.replace("/*", "")),
    ])
  )
}

async function get_app_version(): Promise<string> {
  const packageJson = await fs.readFile("package.json", "utf8")
  const { version } = JSON.parse(packageJson)
  return version || "0.0.0"
}

function html_replace(replacements: [string, string][]) {
  return {
    name: `html_replace`,
    transformIndexHtml: {
      handler: (html: string) => {
        for (const replacement of replacements) {
          html = html.replaceAll(replacement[0], replacement[1])
        }
        return html
      },
    },
  }
}

function after_build(callback: () => void) {
  return { name: "after_build", apply: "build" as const, closeBundle: callback }
}

function updateRouterIndex(file: string, page_dir_from_router_index: string) {
  return {
    name: "update-router-index",
    async buildStart() {
      let imports = ""
      let content = `\nexport default {`
      const files = await fs.readdir(CONFIG.paths.pageDir)
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

const [app_version, aliases] = await Promise.all([
  get_app_version(),
  get_aliases("tsconfig.json"),
])

await Promise.all([
  fs.copyFile(CONFIG.paths.mermaidNode, CONFIG.paths.mermaidPublic),
  fs.copyFile(CONFIG.paths.flexsearchNode, CONFIG.paths.flexsearchPublic),
])

await Jsonjsdb_watcher.set_db(CONFIG.paths.dbPath)
await Promise.all([
  Jsonjsdb_watcher.watch(CONFIG.paths.dbSourcePath),
  Jsonjsdb_watcher.update_preview("preview", CONFIG.paths.previewPath),
  Jsonjsdb_watcher.update_md_files("md_doc", CONFIG.paths.mdPath),
])

export default defineConfig({
  base: "",
  server: { port: CONFIG.serverPort, origin: "", open: true },
  test: { include: ["test/**/*.test.ts"], alias: aliases },
  css: {
    postcss: { plugins: [autoprefixer] },
    preprocessorOptions: { scss: { loadPaths: ["src"] } },
  },
  build: {
    outDir: CONFIG.outDir,
    chunkSizeWarningLimit: CONFIG.chunkSizeLimit,
    rollupOptions: {
      plugins: [
        CONFIG.bundleView &&
          visualizer({ open: true, filename: "bundle_view.html" }),
      ],
    },
  },
  plugins: [
    FullReload(Jsonjsdb_watcher.get_table_index_file_path()),
    jsonjsdb_add_config(CONFIG.paths.jsonjsdbConfig) as any,
    updateRouterIndex(CONFIG.paths.routerIndex, "../page"),
    alias({ entries: aliases }),
    svelte({
      preprocess: vitePreprocess(),
      configFile: false,
      compilerOptions: { runes: true },
    }),
    html_replace([
      ["{{app_version}}", app_version],
      [" crossorigin ", " "],
      [` type="module" src="./`, ` defer src="./`],
    ]),
    after_build(async () => {
      await Promise.all([
        fs.copyFile("LICENSE.md", `${CONFIG.outDir}/LICENSE.md`),
        fs.copyFile("CHANGELOG.md", `${CONFIG.outDir}/CHANGELOG.md`),
      ])
    }),
  ],
})
