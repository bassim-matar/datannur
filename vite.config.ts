import autoprefixer from 'autoprefixer'
import alias from '@rollup/plugin-alias'
import FullReload from 'vite-plugin-full-reload'
import { defineConfig } from 'vitest/config'
import { visualizer } from 'rollup-plugin-visualizer'
import { svelte, type Options } from '@sveltejs/vite-plugin-svelte'
import { jsonjsdbAddConfig } from 'jsonjsdb-builder'
import { updateRouterIndex } from './src/spa-core/vite-plugin-router'
import { spaHtmlOptimizations } from './src/spa-core/vite-plugin-html'
import {
  initBuildConfig,
  copyFilesToOutDir,
  copyPaths,
  initJsonjsdbBuilder,
  copySpaCoreSsg,
} from './src/spa-core/vite-utils'
import svelteConfig from './svelte.config.js'

const outDir = 'app'

const { appVersion, aliases } = await initBuildConfig()

await copyPaths([
  [
    'node_modules/mermaid/dist/mermaid.min.js',
    'public/assets/external/mermaid.min.js',
  ],
  [
    'node_modules/flexsearch/dist/flexsearch.bundle.min.js',
    'public/assets/external/flexsearch.js',
  ],
])

const builder = await initJsonjsdbBuilder(
  {
    dbPath: 'public/data/db',
    dbSourcePath: 'public/data/db-source',
    previewPath: 'public/data/dataset',
    mdPath: 'public/data/md',
  },
  process.env.NODE_ENV === 'development',
)

export default defineConfig({
  base: '',
  server: { port: 8080, origin: '', open: true },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  test: { include: ['test/**/*.test.ts'], alias: aliases },
  css: {
    postcss: { plugins: [autoprefixer] },
    preprocessorOptions: { scss: { loadPaths: ['src'] } },
  },
  build: {
    outDir,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      plugins: [
        (process.env.BUNDLE_VIEW === 'true' || false) &&
          visualizer({ open: true, filename: 'bundle-view.html' }),
      ],
    },
  },
  plugins: [
    FullReload(builder.getTableIndexFile()),
    jsonjsdbAddConfig('public/data/jsonjsdb-config.html'),
    updateRouterIndex('src/.generated/router-index.ts', '../page', 'src/page'),
    alias({ entries: aliases }),
    svelte(svelteConfig as Options),
    spaHtmlOptimizations(),
    copySpaCoreSsg(outDir),
    copyFilesToOutDir(outDir, ['LICENSE.md', 'CHANGELOG.md', 'README.md']),
  ],
})
