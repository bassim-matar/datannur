/**
 * Vite utility functions for build configuration
 */

import fs from 'fs/promises'
import path from 'path'
import { JsonjsdbBuilder } from 'jsonjsdb-builder'

interface TsConfig {
  compilerOptions: { paths: Record<string, string[]> }
}

/**
 * Reads TypeScript path aliases from tsconfig.json and converts them to Vite/Rollup format
 * @param from - Path to tsconfig.json file
 * @returns Object mapping alias names to resolved paths
 */
export async function getAliases(
  from: string,
): Promise<Record<string, string>> {
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

/**
 * Reads app version from package.json
 * @returns Version string (e.g., "0.14.0")
 */
export async function getAppVersion(): Promise<string> {
  const packageJson = await fs.readFile('package.json', 'utf8')
  const { version } = JSON.parse(packageJson) as { version: string }
  return version || '0.0.0'
}

/**
 * Creates a Vite plugin that copies files to the output directory after build
 * @param files - Array of file paths to copy
 * @param outDir - Output directory path
 * @returns Vite plugin configuration
 */
export function copyFilesToOutDir(outDir: string, files: string[]) {
  return {
    name: 'copyFilesToOutDir',
    apply: 'build' as const,
    closeBundle: async () => {
      await Promise.all(
        files.map(file => fs.copyFile(file, `${outDir}/${file}`)),
      )
    },
  }
}

/**
 * Creates a Vite plugin that runs a callback after build completes
 * @param callback - Function to execute after build
 * @returns Vite plugin configuration
 */
export function afterBuild(callback: () => void | Promise<void>) {
  return {
    name: 'afterBuild',
    apply: 'build' as const,
    closeBundle: callback,
  }
}

/**
 * Creates a Vite plugin that copies spa-core files to app/node-scripts for SSG usage
 * @param outDir - Output directory (e.g., 'app')
 * @returns Vite plugin configuration
 */
export function copySpaCoreSsg(outDir: string) {
  return {
    name: 'copySpaCoreSsg',
    apply: 'build' as const,
    closeBundle: async () => {
      const spaCoreDest = `${outDir}/node-scripts/spa-core`
      await fs.mkdir(spaCoreDest, { recursive: true })

      const files = ['ssg.ts', 'ssg-jsonjsdb.ts']
      await Promise.all(
        files.map(file =>
          fs.copyFile(`src/spa-core/${file}`, `${spaCoreDest}/${file}`),
        ),
      )
    },
  }
}

interface BuildConfigOptions {
  tsconfigPath?: string
}

/**
 * Initializes build configuration by loading aliases and app version
 * @param options - Configuration options
 * @returns Object containing appVersion and aliases
 */
export async function initBuildConfig(options: BuildConfigOptions = {}) {
  const { tsconfigPath = 'tsconfig.json' } = options
  const [appVersion, aliases] = await Promise.all([
    getAppVersion(),
    getAliases(tsconfigPath),
  ])
  return { appVersion, aliases }
}

/**
 * Copy files from source to destination paths
 * @param pairs - Array of [source, destination] path pairs
 * @returns Promise that resolves when all copies complete
 */
export async function copyPaths(pairs: [string, string][]) {
  return Promise.all(pairs.map(([from, to]) => fs.copyFile(from, to)))
}

/**
 * Initialize and configure JsonjsdbBuilder instance
 * @param paths - Configuration paths for database, preview, and markdown
 * @param isDevelopment - Whether to watch database in development mode
 * @returns Configured JsonjsdbBuilder instance
 */
export async function initJsonjsdbBuilder(
  paths: {
    dbPath: string
    dbSourcePath: string
    previewPath: string
    mdPath: string
  },
  isDevelopment = false,
) {
  const builder = new JsonjsdbBuilder()
  await builder.setOutputDb(paths.dbPath)
  await Promise.all([
    builder.updateDb(paths.dbSourcePath),
    builder.updatePreview('preview', paths.previewPath),
    builder.updateMdDir('md-doc', paths.mdPath),
  ])
  if (isDevelopment) {
    builder.watchDb(paths.dbSourcePath)
  }
  return builder
}
