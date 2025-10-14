<script lang="ts">
  import db from '@db'
  import { router } from '@lib/router.svelte.js'
  import { appMode } from '@lib/util'
  import Logs from '@lib/logs'
  import {
    page,
    pageHash,
    pageContentLoaded,
    reloadIncrement,
  } from '@lib/store'
  import { UrlHash } from '@lib/url-hash'
  import routerIndex from '@src/.generated/router-index'
  import type { Component } from 'svelte'
  import type { Row } from '@type'
  import type { EntityName } from '@type'
  import type { Match } from 'navigo'

  type RouteEntityName = keyof typeof routerIndex

  let entityGlobal = $state('')
  let params = $state({})
  let entityId = $state('')
  let pageKey = $derived(`${entityGlobal}___${entityId}___${$reloadIncrement}`)

  // Dynamic router handling multiple component types with varying props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let route = $state<Component<any>>(routerIndex._loading.component)

  function isSpaHomepage() {
    return (
      appMode !== 'static_render' &&
      (!window.location.hash || window.location.hash === '#')
    )
  }

  function updateRoute(entity: RouteEntityName, newParams: Row | null = null) {
    if (newParams) params = newParams
    $pageContentLoaded = false
    route = routerIndex[entity].component
    $page = entity
    setTimeout(() => ($pageHash = UrlHash.getLevel1()), 1)
  }

  function setRoute(entity: RouteEntityName) {
    return (ctx?: Match) => {
      route = routerIndex._loading.component
      params = {}
      entityId = ''
      window.document.body.setAttribute('page', entity)
      if (!ctx?.data) {
        if (!ctx) return
        ctx.data = {}
      }
      if (ctx.data.id === undefined) {
        if (ctx.data[0]) ctx.data = {}
        updateRoute(entity, ctx.data)
        setTimeout(() => Logs.add('loadPage', { entity }), 10)
        return
      }
      entityId = ctx.data.id
      const entityData = db.get(entity as EntityName, entityId)
      if (entityData) {
        updateRoute(entity, { [entity]: entityData, id: entityId })
        setTimeout(() => Logs.add('loadPage', { entity, entityId }), 10)
      } else {
        updateRoute('_error', { entity })
        Logs.add('loadPage', { entity: '_error' })
      }
    }
  }

  if ('_index' in routerIndex) {
    router.on('/', setRoute('_index'))
  }
  for (const [entityGlobal, props] of Object.entries(routerIndex)) {
    let routeUrl: string | false = false
    if (['_index', '_error', '_loading'].includes(entityGlobal)) continue
    else if ('param' in props) routeUrl = `/${entityGlobal}/:${props.param}`
    else routeUrl = `/${entityGlobal}`

    if (routeUrl) {
      router.on(routeUrl, setRoute(entityGlobal as RouteEntityName))
    }
  }
  if ('_error' in routerIndex) {
    router.notFound(setRoute('_error'), {
      before: (done: unknown) => {
        if (isSpaHomepage()) router.resolve('/')
        ;(done as () => void)()
      },
    })
  }

  if (isSpaHomepage()) router.resolve('/')
  else router.resolve()

  console.log('init global timer', Math.round(performance.now()) + ' ms')

  const SvelteComponent = $derived(route)
</script>

{#key pageKey}
  <SvelteComponent {...params} />
{/key}
