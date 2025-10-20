# SPA Core

Generic SPA utilities that can be reused in other projects.

## Directory Structure

```
spa-core/
├── url.ts                      # URL and routing parameters management
├── app-bootstrap.ts            # App initialization (mount/hydrate)
├── browser-utils.ts            # Browser detection & responsive utilities
├── router/                     # Routing system
│   ├── GenericRouter.svelte    # Main router component
│   ├── router.svelte.ts        # Navigo router instance
│   ├── router-helpers.ts       # Route initialization helpers
│   ├── router-registration.ts  # Route registration logic
│   └── router-store.ts         # Router-related stores
├── ssg/                        # Static Site Generation
│   ├── ssg.ts                  # Core SSG utilities
│   └── ssg-jsonjsdb.ts         # SSG for jsonjsdb integration
└── vite/                       # Vite build plugins
    ├── vite-plugin-router.ts   # Auto-generate router index
    ├── vite-plugin-html.ts     # HTML transformations
    └── vite-utils.ts           # Build configuration utilities
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

**Usage:**

```typescript
import { UrlParam, UrlHash, link } from '@spa-core/url'

// URL parameters
const value = UrlParam.get('key')
UrlParam.set('key', 'value')

// Hash routing
const hash = UrlHash.getLevel1()

// Generate links
const href = link('page', { id: '123' })
```

### `app-bootstrap.ts`

Application initialization utilities for Svelte mounting and hydration.

**Exports:**

- `bootstrapApp()` - Mount or hydrate Svelte app based on mode
- `removeStaticOnlyHeadElements()` - Clean up SSG-only elements

**Usage:**

```typescript
import { bootstrapApp } from '@spa-core/app-bootstrap'
import App from './App.svelte'

await bootstrapApp(App, 'app', async () => {
  // Optional initialization function
  await initializeDatabase()
})
```

### `browser-utils.ts`

Browser and device detection utilities for responsive design.

**Exports:**

- `isFirefox` - Boolean indicating Firefox browser
- `isMobile` - Boolean for mobile devices (< 600px)
- `isSmallMenu` - Writable store for small menu state (< 1023px)
- `documentWidth` - Current document width
- `hasTouchScreen` - Boolean for touch-capable devices
- `getIsMobile()` - Function to check if mobile
- `getIsSmallMenu()` - Function to check if small menu

**Usage:**

```typescript
import { isMobile, isSmallMenu, hasTouchScreen } from '@spa-core/browser-utils'

if (isMobile) {
  // Render mobile layout
}

$: menuCollapsed = $isSmallMenu
```

### Router (`router/`)

#### `router.svelte.ts`

SPA router integration using Navigo.

**Exports:**

- `router` - Navigo router instance
- `window.goToHref` - Global navigation function

**Features:**

- Hash-based or path-based routing (auto-detected)
- Ctrl/Cmd+Click handling for new tabs
- Smart reload on same-page navigation
- External link detection

**Usage:**

```typescript
import { router } from '@spa-core/router/router.svelte'

router.navigate('/about')
```

#### `GenericRouter.svelte`

Generic router component for SPA applications.

**Usage:**

```svelte
<script>
  import GenericRouter from '@spa-core/router/GenericRouter.svelte'
  import routerIndex from './router-index'

  const store = {
    page,
    pageContentLoaded,
    whenAppReady
  }
</script>

<GenericRouter
  {routerIndex}
  {store}
  onRouteChange={handleRouteChange}
  getEntityData={getEntity}
/>
```

#### `router-store.ts`

Router-related Svelte stores.

**Exports:**

- `pageHash` - Current page hash value
- `pageLoadedRoute` - Last loaded route identifier

### SSG (`ssg/`)

#### `ssg.ts`

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
import { generateStaticSite } from '@spa-core/ssg/ssg'

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

#### `ssg-jsonjsdb.ts`

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
import { generateJsonjsdbStaticSite } from '@spa-core/ssg/ssg-jsonjsdb'

await generateJsonjsdbStaticSite('./data/static-make.config.json', './public')
```

### Vite Plugins (`vite/`)

#### `vite-plugin-router.ts`

Vite plugin to auto-generate router index from page files.

**Exports:**

- `updateRouterIndex()` - Generate router configuration from `src/page/*.svelte`

**Usage:**

```typescript
import { updateRouterIndex } from '@spa-core/vite/vite-plugin-router'

export default defineConfig({
  plugins: [
    updateRouterIndex('./src/router-index.ts', '../page', './src/page'),
  ],
})
```

#### `vite-plugin-html.ts`

Vite plugin for HTML transformations in SPA build.

**Exports:**

- `htmlReplace()` - Generic HTML pattern replacement
- `spaHtmlOptimizations()` - Pre-configured SPA optimizations

**Usage:**

```typescript
import { spaHtmlOptimizations } from '@spa-core/vite/vite-plugin-html'

export default defineConfig({
  plugins: [spaHtmlOptimizations()],
})
```

#### `vite-utils.ts`

Build configuration utilities for Vite projects.

**Exports:**

- `initBuildConfig()` - Load version and aliases
- `copyPaths()` - Copy files from source to destination
- `copyFilesToOutDir()` - Vite plugin to copy files after build
- `copySpaCoreSsg()` - Copy SSG files to output directory
- `getAliases()` - Read TypeScript path aliases
- `getAppVersion()` - Read app version from package.json

**Usage:**

```typescript
import { initBuildConfig, copySpaCoreSsg } from '@spa-core/vite/vite-utils'

const { appVersion, aliases } = await initBuildConfig()

export default defineConfig({
  plugins: [copySpaCoreSsg('app')],
})
```
