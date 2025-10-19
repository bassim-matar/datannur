import { mount, hydrate } from 'svelte'
import App from './App.svelte'
import { initApp } from './app-mode/app-init'
import { isStaticMode, isSsgRendering } from '@lib/util'

const target = document.getElementById('app')
if (!target) {
  throw new Error("Could not find target element with id 'app'")
}

const hasStaticContent = target.children.length > 0

// remove specific static-only head elements
;[
  'meta[name="description"]',
  'link[rel="shortcut icon"]',
  'link[rel="manifest"]',
].forEach(el => document.querySelector(el)?.remove())

// remove jsonjsdb static scripts (only needed during SSG rendering)
document.querySelectorAll('script[src*="data/db/"]').forEach(el => el.remove())

async function startApp() {
  if (!target) return

  if (isStaticMode && hasStaticContent) {
    if (!isSsgRendering) {
      try {
        await initApp()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    return hydrate(App, { target })
  } else {
    target.innerHTML = ''
    return mount(App, { target })
  }
}

const app = startApp()

export default app
