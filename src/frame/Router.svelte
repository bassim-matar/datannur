<script lang="ts">
  import db from '@db'
  import { router } from '@lib/router.svelte.js'
  import { appMode, isStaticMode, isSsgRendering } from '@lib/util'
  import Logs from '@lib/logs'
  import {
    page,
    pageHash,
    pageContentLoaded,
    reloadIncrement,
    whenAppReady,
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
  let routerInitialized = $state(false)

  const initialPage = (() => {
    if (isStaticMode) {
      const bodyPage = document.body.getAttribute('page')
      if (bodyPage && bodyPage in routerIndex) {
        return bodyPage as RouteEntityName
      }
    }
    return '_loading' as RouteEntityName
  })()

  // In static mode, start with _loading to avoid flash, then hydrate to actual page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let route = $state<Component<any>>(
    isStaticMode && !isSsgRendering
      ? routerIndex._loading.component
      : routerIndex[initialPage].component,
  )

  // Once app is ready, switch from _loading to the actual initial page
  if (isStaticMode && !isSsgRendering) {
    $whenAppReady.then(() => {
      if (initialPage !== '_loading') {
        route = routerIndex[initialPage].component
      }
    })
  }

  function isSpaHomepage() {
    return (
      appMode !== 'static_render' &&
      (!window.location.hash || window.location.hash === '#')
    )
  }

  function updateRoute(entity: RouteEntityName, newParams: Row | null = null) {
    if (newParams) params = newParams
    $pageContentLoaded = false

    // In static mode before first navigation, don't reload the component (for hydration)
    // Just update stores to match the pre-rendered content
    if (isStaticMode && !routerInitialized && entity === initialPage) {
      $page = entity
      setTimeout(() => ($pageHash = UrlHash.getLevel1()), 1)
    } else {
      // Normal route change: load new component and update stores
      route = routerIndex[entity].component
      $page = entity
      setTimeout(() => ($pageHash = UrlHash.getLevel1()), 1)
    }
  }

  function setRoute(entity: RouteEntityName) {
    return async (ctx?: Match) => {
      // Show loading screen (except on first static render to avoid flash)
      if (routerInitialized || !isStaticMode) {
        route = routerIndex._loading.component
        params = {}
        entityId = ''
      }

      window.document.body.setAttribute('page', entity)

      // Wait for app initialization on first navigation in static mode
      if (!routerInitialized) {
        await $whenAppReady
        routerInitialized = true
      }

      // Handle route without ID (list pages)
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

      // Handle route with ID (detail pages)
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

  // Register homepage route
  if ('_index' in routerIndex) {
    router.on('/', setRoute('_index'))
  }

  // Register all entity routes (datasets, folders, etc.)
  for (const [entityName, props] of Object.entries(routerIndex)) {
    if (['_index', '_error', '_loading'].includes(entityName)) continue

    const routeUrl =
      'param' in props ? `/${entityName}/:${props.param}` : `/${entityName}`

    router.on(routeUrl, setRoute(entityName as RouteEntityName))
  }

  // Register 404 error handler
  if ('_error' in routerIndex) {
    router.notFound(setRoute('_error'), {
      before: (done: unknown) => {
        if (isSpaHomepage()) router.resolve('/')
        ;(done as () => void)()
      },
    })
  }

  // Start router
  if (isSpaHomepage()) router.resolve('/')
  else router.resolve()

  console.log('init global timer', Math.round(performance.now()) + ' ms')

  const SvelteComponent = $derived(route)
  const useKey = $derived(routerInitialized || !isStaticMode)
</script>

{#if useKey}
  {#key pageKey}
    <SvelteComponent {...params} />
  {/key}
{:else}
  <SvelteComponent {...params} />
{/if}
