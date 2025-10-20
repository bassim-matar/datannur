# SPA Core

Generic SPA utilities that can be reused in other projects.

## Modules

### `url-param.ts`

Manages URL parameters for both hash-based and path-based routing.

**Features:**

- Handles hash routing (`#/page?param=value`)
- Handles static mode (SSG with query strings)
- Type-safe parameter management
- History API integration

**Usage:**

```typescript
import { UrlParam } from './spa-core/url-param'

// Initialize (detects app mode)
UrlParam.init()

// Get app mode
const mode = UrlParam.getAppMode() // 'spa' | 'static_render'

// Get/set parameters
const value = UrlParam.get('key')
UrlParam.set('key', 'value')
UrlParam.delete('key')
UrlParam.reset()

// Get all parameters
const allParams = UrlParam.getAllParams()
```

## Modules Overview

### `url.ts`

Complete URL management for SPA applications.

**Exports:**

- `UrlParam` - URL parameters management (get, set, delete, reset)
- `UrlHash` - Hash routing management (getAll, getLevel1, getLevel2)
- `isHttp` - Check if protocol is HTTP
- `isSsgRendering` - Check if in SSG rendering mode
- `isStaticMode` - Check if in static mode
- `urlPrefix` - Get URL prefix for links
- `getBaseLinkUrl()` - Get base URL for links
- `link()` - Generate HTML links

### `router.svelte.ts`

SPA router integration using Navigo.

**Exports:**

- `router` - Navigo router instance
- `window.goToHref` - Global navigation function

**Features:**

- Hash-based or path-based routing (auto-detected)
- Ctrl/Cmd+Click handling for new tabs
- Smart reload on same-page navigation
- External link detection

### `ssg.ts`

Static Site Generation (SSG) utilities for pre-rendering SPA pages.

**Exports:**

- `generateStaticSite()` - Main SSG function
- `capturePage()` - Capture single page as HTML
- `generateSitemap()` - Generate sitemap.xml for SEO
- `createIndexFile()` - Create static index with metadata
- `startServer()` / `stopServer()` - Local server management
- `initPage()` - Initialize Playwright page
- `waitUntilReady()` - Server readiness check

**Usage:**

```typescript
import { generateStaticSite } from '@spa-core/ssg'

const routes = ['', 'about', 'contact', 'blog/post-1']
await generateStaticSite(routes, {
  domain: 'https://example.com',
  port: 3000,
  appPath: './app',
  outDir: './dist',
  generateSitemap: true,
  indexSeo: true,
})
```

### `ssg-jsonjsdb.ts`

SSG utilities for jsonjsdb integration (extends `ssg.ts`).

**Exports:**

- `getEntitiesRoutes()` - Generate routes from jsonjsdb entities
- `getDbMetaPath()` - Find database metadata path
- `arrayToObject()` - Convert array-based DB data to objects
- `getDbPathFromContent()` - Extract DB path from HTML
- `createEntityDirs()` - Create entity output directories
- `loadSsgConfig()` - Load SSG configuration from JSON
- `generateJsonjsdbStaticSite()` - Complete SSG workflow (all-in-one)

**Usage (simple - recommended):**

```typescript
import { generateJsonjsdbStaticSite } from '@spa-core/ssg-jsonjsdb'

// One function does everything!
await generateJsonjsdbStaticSite('./data/static-make.config.json', './public')
```

**Usage (granular):**

```typescript
import { generateStaticSite } from '@spa-core/ssg'
import {
  getDbMetaPath,
  getEntitiesRoutes,
  getDbPathFromContent,
} from '@spa-core/ssg-jsonjsdb'

const dbPath = await getDbMetaPath('public/data/db')
const routes = await getEntitiesRoutes(dbPath, ['dataset', 'institution'])

await generateStaticSite(routes, config, {
  waitForDbSelector: '#db-loaded',
  dbPathExtractor: getDbPathFromContent,
})
```

**Config format (`static-make.config.json`):**

```json
{
  "domain": "https://example.com",
  "indexSeo": true,
  "appPath": "./app",
  "outDir": "./dist",
  "dbMetaPath": "./data/db",
  "port": 3000,
  "entities": ["dataset", "institution", "folder"],
  "routes": ["", "about", "contact"]
}
```

### `vite-plugin-router.ts`

Vite plugin to auto-generate router index from page files.

**Exports:**

- `updateRouterIndex()` - Generate router configuration

### `vite-plugin-html.ts`

Vite plugin for HTML transformations in SPA build.

**Exports:**

- `htmlReplace()` - Generic HTML pattern replacement
- `spaHtmlOptimizations()` - Pre-configured SPA optimizations

### `vite-utils.ts`

Build configuration utilities for Vite projects.

**Exports:**

- `initBuildConfig()` - Load version and aliases
- `copyPaths()` - Copy files from source to destination
- `copyFilesToOutDir()` - Vite plugin to copy files after build
- `initJsonjsdbBuilder()` - Configure JsonjsdbBuilder
- `getAliases()` - Read TypeScript path aliases
- `getAppVersion()` - Read app version from package.json
- `afterBuild()` - Run callback after build

## Migration Status

- [x] `url-param.ts` - Migrated to `url.ts`
- [x] `url-hash.ts` - Migrated to `url.ts`
- [x] `router.svelte.ts` - Migrated to `spa-core/`
- [x] Vite plugins - Migrated to `spa-core/`
- [x] SSG utilities - Created `ssg.ts`
