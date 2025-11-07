import { defineConfig } from 'vite'
import { resolve } from 'path'
import { cpSync, mkdirSync, existsSync } from 'fs'

// Copy sql.js to output
function copySqlJs() {
  return {
    name: 'copy-sqljs',
    closeBundle() {
      // Copy WASM files to out root
      cpSync('node_modules/sql.js/dist/sql-wasm.js', 'out/sql-wasm.js')
      cpSync('node_modules/sql.js/dist/sql-wasm.wasm', 'out/sql-wasm.wasm')

      // Also copy full sql.js module for extension runtime
      const outNodeModules = 'out/node_modules/sql.js'
      const outDist = 'out/node_modules/sql.js/dist'
      if (!existsSync(outNodeModules)) {
        mkdirSync(outNodeModules, { recursive: true })
      }
      if (!existsSync(outDist)) {
        mkdirSync(outDist, { recursive: true })
      }

      // Copy dist files
      cpSync('node_modules/sql.js/dist', outDist, { recursive: true })

      // Copy package.json for module resolution
      cpSync(
        'node_modules/sql.js/package.json',
        'out/node_modules/sql.js/package.json',
      )
    },
  }
}

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['vscode', 'fs', 'path', 'crypto', 'sql.js'],
      output: {
        format: 'cjs',
        entryFileNames: 'index.js',
      },
      plugins: [copySqlJs()],
    },
    outDir: 'out',
    sourcemap: true,
    minify: false,
    target: 'node18',
    ssr: true,
  },
  plugins: [copySqlJs()],
})
