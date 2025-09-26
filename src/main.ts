import { mount } from 'svelte'
import App from './App.svelte'

const target = document.getElementById('app')
if (!target) {
  throw new Error("Could not find target element with id 'app'")
}

// remove specific static-only head elements
;[
  'meta[name="description"]',
  'link[rel="shortcut icon"]',
  'link[rel="manifest"]',
].forEach(el => document.querySelector(el)?.remove())

// reset app content
target.innerHTML = ''

const app = mount(App, { target })

export default app
