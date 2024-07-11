<script>
  import page from "page"
  import db from "@db"
  import { is_http, app_mode, subfolder } from "@js/util"
  import Logs from "@js/Logs"
  import { page_hash, page_content_loaded } from "@js/store"
  import { url_hash } from "@js/url_hash"
  import router_index from "@src/.generated/router_index"

  let route = router_index._loading.component
  let params = {}
  let entity = ""
  let entity_id = ""
  $: page_key = `${entity}___${entity_id}`

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
      if (ctx.params.id === undefined) {
        if (ctx.params[0]) ctx.params = {}
        update_route(entity, ctx.params)
        setTimeout(() => Logs.add("load_page", { entity }), 10)
        return false
      }
      entity_id = ctx.params.id
      const entity_data = db.get(entity, entity_id)
      if (entity_data) {
        update_route(entity, { [entity]: entity_data })
        setTimeout(() => Logs.add("load_page", { entity, entity_id }), 10)
      } else {
        update_route("_error", { entity })
        Logs.add("load_page", { entity: "_error" })
      }
    }
  }

  for (const [entity, { param }] of Object.entries(router_index)) {
    let route_url = false
    if (entity === "_index") route_url = "/"
    else if (["_error", "_loading"].includes(entity)) continue
    else if (param) route_url = `/${entity}/:${param}`
    else route_url = `/${entity}`
    if (route_url) page(route_url, set_route(entity))
  }
  if ("_error" in router_index) page("/*", set_route("_error"))

  page({ hashbang: app_mode !== "static_render" })

  if (is_http && app_mode !== "static_render") page.base("/#!")
  if (!is_http && app_mode !== "static_render") page.base("")
  if (is_http && app_mode === "static_render") {
    page.base("")
  }

  if (is_http && app_mode !== "static_render" && subfolder) {
    page.base(`/${subfolder}/#!`)
  }
</script>

{#key page_key}
  <svelte:component this={route} {...params} />
{/key}
