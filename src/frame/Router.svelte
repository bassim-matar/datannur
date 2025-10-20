<script lang="ts">
  import db from '@db'
  import GenericRouter from '@spa-core/GenericRouter.svelte'
  import Logs from '@lib/logs'
  import { page, pageHash, pageContentLoaded, whenAppReady } from '@lib/store'
  import routerIndex from '@src/.generated/router-index'
  import type { EntityName } from '@type'

  function handleRouteChange(ctx: {
    entity: string
    params: Record<string, unknown>
    entityId: string
  }) {
    setTimeout(
      () =>
        Logs.add('loadPage', {
          entity: ctx.entity,
          ...(ctx.entityId && { entityId: ctx.entityId }),
        }),
      10,
    )
  }
</script>

<GenericRouter
  {routerIndex}
  store={{
    page: { set: v => page.set(v) },
    pageHash: { set: v => pageHash.set(v) },
    pageContentLoaded: { set: v => pageContentLoaded.set(v) },
    whenAppReady: $whenAppReady,
  }}
  onRouteChange={handleRouteChange}
  getEntityData={(entity, id) => db.get(entity as EntityName, id)}
  errorPage="_error"
  loadingPage="_loading"
/>
