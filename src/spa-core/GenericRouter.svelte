<script lang="ts" generics="T extends string">
  import { router } from './router.svelte'
  import { registerRoutes } from './router-registration'
  import {
    getInitialPage,
    getInitialComponent,
    updateRouteComponent,
  } from './router-helpers'
  import { UrlHash, isStaticMode, isSsgRendering } from './url'
  import type { Component } from 'svelte'
  import type { Match } from 'navigo'
  import type { RouterIndex } from './router-registration'

  interface Props<T extends string> {
    routerIndex: RouterIndex
    store: {
      page: { set: (value: T) => void }
      pageHash: { set: (value: string) => void }
      pageContentLoaded: { set: (value: boolean) => void }
      whenAppReady: Promise<void>
    }
    onRouteChange?: (ctx: {
      entity: T
      params: Record<string, unknown>
      entityId: string
    }) => void
    getEntityData?: (entity: string, id: string) => unknown
    errorPage?: T
    loadingPage?: T
  }

  let {
    routerIndex,
    store,
    onRouteChange,
    getEntityData,
    errorPage = '_error' as T,
    loadingPage = '_loading' as T,
  }: Props<T> = $props()

  let entityGlobal = $state('')
  let params = $state({})
  let entityId = $state('')
  let reloadIncrement = $state(0)
  let pageKey = $derived(`${entityGlobal}___${entityId}___${reloadIncrement}`)
  let routerInitialized = $state(false)

  const initialPage = getInitialPage(routerIndex, loadingPage)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let route = $state<Component<any>>(
    getInitialComponent(routerIndex, initialPage, loadingPage),
  )

  if (isStaticMode && !isSsgRendering) {
    store.whenAppReady.then(() => {
      if (initialPage !== loadingPage && initialPage in routerIndex) {
        route = routerIndex[initialPage].component
      }
    })
  }

  function updateRoute(
    entity: T,
    newParams: Record<string, unknown> | null = null,
  ) {
    if (newParams) params = newParams
    store.pageContentLoaded.set(false)

    route = updateRouteComponent(
      routerIndex,
      entity,
      initialPage,
      routerInitialized,
      route,
    )

    store.page.set(entity)
    setTimeout(() => store.pageHash.set(UrlHash.getLevel1()), 1)
  }

  function setRoute(entity: T) {
    return async (ctx?: Match) => {
      if (routerInitialized || !isStaticMode) {
        if (loadingPage in routerIndex) {
          route = routerIndex[loadingPage].component
        }
        params = {}
        entityId = ''
      }

      window.document.body.setAttribute('page', entity)

      if (!routerInitialized) {
        await store.whenAppReady
        routerInitialized = true
      }

      if (!ctx?.data) {
        if (!ctx) return
        ctx.data = {}
      }

      if (ctx.data.id === undefined) {
        if (ctx.data[0]) ctx.data = {}
        updateRoute(entity, ctx.data)
        onRouteChange?.({ entity, params: ctx.data, entityId: '' })
        return
      }

      entityId = ctx.data.id
      const entityData = getEntityData?.(entity, entityId)
      if (entityData) {
        updateRoute(entity, { [entity]: entityData, id: entityId })
        onRouteChange?.({
          entity,
          params: { [entity]: entityData, id: entityId },
          entityId,
        })
      } else {
        updateRoute(errorPage, { entity })
        onRouteChange?.({ entity: errorPage, params: { entity }, entityId: '' })
      }
    }
  }

  registerRoutes(router, routerIndex, entityName => setRoute(entityName as T))

  // Expose reload function globally for router.svelte.ts
  router.incrementReload = () => {
    reloadIncrement++
  }

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
