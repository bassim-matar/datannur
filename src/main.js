import App from "./App.svelte"

const app_dom = document.getElementById('app')
app_dom.innerHTML = ''

const app = new App({
  target: app_dom,
  props: {},
})

export default app
