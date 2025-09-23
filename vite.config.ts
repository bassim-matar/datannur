import path from 'path'
import fs from 'fs/promises'
import autoprefixer from 'autoprefixer'
import alias from '@rollup/plugin-alias'
import FullReload from 'vite-plugin-full-reload'
import { defineConfig } from 'vitest/config'
import { visualizer } from 'rollup-plugin-visualizer'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { JsonjsdbBuilder, jsonjsdbAddConfig } from 'jsonjsdb-builder'
import svelteConfig from './svelte.config.js'

const config = {
  bundleView: process.env.BUNDLE_VIEW === 'true' || false,
  outDir: 'app',
  serverPort: 8080,
  chunkSizeLimit: 1000,
  paths: {
    routerIndex: 'src/.generated/router-index.ts',
    pageDir: 'src/page',
    mermaidNode: 'node_modules/mermaid/dist/mermaid.min.js',
    mermaidPublic: 'public/assets/external/mermaid.min.js',
    flexsearchNode: 'node_modules/flexsearch/dist/flexsearch.bundle.min.js',
    flexsearchPublic: 'public/assets/external/flexsearch.js',
    jsonjsdbConfig: 'public/data/jsonjsdb-config.html',
    dbPath: 'public/data/db',
    dbSourcePath: 'public/data/db_source',
    previewPath: 'public/data/dataset',
    mdPath: 'public/data/md',
  },
} as const

interface TsConfig {
  compilerOptions: { paths: Record<string, string[]> }
}

async function getAliases(from: string): Promise<Record<string, string>> {
  const {
    compilerOptions: { paths },
  } = JSON.parse(await fs.readFile(from, 'utf8')) as TsConfig
  return Object.fromEntries(
    Object.entries(paths).map(([find, [replacement]]) => [
      find.replace('/*', ''),
      path.resolve(replacement.replace('/*', '')),
    ]),
  )
}

async function getAppVersion(): Promise<string> {
  const packageJson = await fs.readFile('package.json', 'utf8')
  const { version } = JSON.parse(packageJson)
  return version || '0.0.0'
}

function htmlReplace(replacements: [string, string][]) {
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

function copyFilesToOutDir(files: string[]) {
  return Promise.all(
    files.map(file => fs.copyFile(file, `${config.outDir}/${file}`)),
  )
}

function afterBuild(callback: () => void) {
  return { name: 'after_build', apply: 'build' as const, closeBundle: callback }
}

function updateRouterIndex(file: string, pageDirFromRouterIndex: string) {
  return {
    name: 'update-router-index',
    async buildStart() {
      let imports = ''
      let content = `\nexport default {`
      const files = await fs.readdir(config.paths.pageDir)
      for (const file of files) {
        if (!file.endsWith('.svelte')) continue
        const filename = file.replace('.svelte', '')
        const moduleName = filename.split('[')[0]
        const routeName =
          moduleName.charAt(0).toLowerCase() + moduleName.slice(1)
        let param: string | false = false
        if (filename.includes('['))
          param = `"${filename.split('[')[1].split(']')[0]}"`
        const modulePath = `${pageDirFromRouterIndex}/${filename}.svelte`
        imports += `import ${moduleName} from "${modulePath}"\n`
        content += `\n  ${routeName}: { component: ${moduleName}, param: ${param} },`
      }
      content += '\n}\n'
      await fs.writeFile(file, imports + content, 'utf8')
    },
  }
}

const [appVersion, aliases] = await Promise.all([
  getAppVersion(),
  getAliases('tsconfig.json'),
])

await Promise.all([
  fs.copyFile(config.paths.mermaidNode, config.paths.mermaidPublic),
  fs.copyFile(config.paths.flexsearchNode, config.paths.flexsearchPublic),
])

const builder = new JsonjsdbBuilder()
await builder.setOutputDb(config.paths.dbPath)
await Promise.all([
  builder.updateDb(config.paths.dbSourcePath),
  builder.updatePreview('preview', config.paths.previewPath),
  builder.updateMdDir('md_doc', config.paths.mdPath),
])
if (process.env.NODE_ENV === 'development') {
  builder.watchDb('db')
}

export default defineConfig({
  base: '',
  server: { port: config.serverPort, origin: '', open: true },
  test: { include: ['test/**/*.test.ts'], alias: aliases },
  css: {
    postcss: { plugins: [autoprefixer] },
    preprocessorOptions: { scss: { loadPaths: ['src'] } },
  },
  build: {
    outDir: config.outDir,
    chunkSizeWarningLimit: config.chunkSizeLimit,
    rollupOptions: {
      plugins: [
        config.bundleView &&
          visualizer({ open: true, filename: 'bundle_view.html' }),
      ],
    },
  },
  plugins: [
    FullReload(builder.getTableIndexFile()),
    jsonjsdbAddConfig(config.paths.jsonjsdbConfig),
    updateRouterIndex(config.paths.routerIndex, '../page'),
    alias({ entries: aliases }),
    svelte(svelteConfig),
    htmlReplace([
      ['{{app_version}}', appVersion],
      [' crossorigin ', ' '],
      [` type="module" src="./`, ` defer src="./`],
    ]),
    afterBuild(async () => {
      await copyFilesToOutDir(['LICENSE.md', 'CHANGELOG.md', 'README.md'])
    }),
  ],
})
