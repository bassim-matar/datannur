import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/extension.ts'),
      formats: ['cjs'],
      fileName: () => 'extension.js',
    },
    rollupOptions: {
      external: ['vscode', 'fs', 'path', 'crypto', 'sql.js'],
      output: {
        format: 'cjs',
        entryFileNames: 'extension.js',
      },
    },
    outDir: 'out',
    sourcemap: true,
    minify: false,
    target: 'node18',
    ssr: true,
  },
})
