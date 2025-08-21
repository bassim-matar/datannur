<script>
  import db from "@db"
  import { router } from "@js/router.svelte.js"
  import { app_mode } from "@js/util"
  import Logs from "@js/Logs"
  import {
    page_hash,
    page_content_loaded,
    reload_increment,
  } from "@js/store"
  import { url_hash } from "@js/url_hash"
  import router_index from "@src/.generated/router_index"

  let entity_global = $state("")
  let route = $state(router_index._loading.component)
  let params = $state({})
  let entity_id = $state("")
  let page_key = $derived(
    `${entity_global}___${entity_id}___${$reload_increment}`,
  )

  function is_spa_homepage() {
    return (
      app_mode !== "static_render" &&
      (!window.location.hash || window.location.hash === "#")
    )
  }

  function update_route(entity, new_params = false) {
    if (new_params) params = new_params
    $page_content_loaded = false
    route = router_index[entity].component
    setTimeout(() => ($page_hash = url_hash.get_level_1()), 1)
  }

  function set_route(entity) {
    return ctx => {
      route = router_index._loading.component
      params = {}
      entity_id = ""
      window.document.body.setAttribute("page", entity)
      if (!ctx.data) ctx.data = {}
      if (ctx.data.id === undefined) {
        if (ctx.data[0]) ctx.data = {}
        update_route(entity, ctx.data)
        setTimeout(() => Logs.add("load_page", { entity }), 10)
        return false
      }
      entity_id = ctx.data.id
      const entity_data = db.get(entity, entity_id)
      if (entity_data) {
        update_route(entity, { [entity]: entity_data, id: entity_id })
        setTimeout(() => Logs.add("load_page", { entity, entity_id }), 10)
      } else {
        update_route("_error", { entity })
        Logs.add("load_page", { entity: "_error" })
      }
    }
  }

  if ("_index" in router_index) {
    router.on("/", set_route("_index"))
  }
  for (const [entity_global, { param }] of Object.entries(router_index)) {
    let route_url = false
    if (["_index", "_error", "_loading"].includes(entity_global)) continue
    else if (param) route_url = `/${entity_global}/:${param}`
    else route_url = `/${entity_global}`

    if (route_url) {
      router.on(route_url, set_route(entity_global))
    }
  }
  if ("_error" in router_index) {
    router.notFound(set_route("_error"), {
      before(done) {
        if (is_spa_homepage()) router.resolve("/")
        done()
      },
    })
  }

  is_spa_homepage() ? router.resolve("/") : router.resolve()

  console.log(
    "init global timer",
    Math.round(performance.now() - window.__global_timer) + " ms",
  )

  const SvelteComponent = $derived(route)
</script>

{#key page_key}
  <SvelteComponent {...params} />
{/key}
