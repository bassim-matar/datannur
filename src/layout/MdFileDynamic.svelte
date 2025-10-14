<script lang="ts">
  import { onMount } from 'svelte'
  import db from '@db'
  import MdContent from '@layout/MdContent.svelte'
  import Loading from '@frame/Loading.svelte'

  let { docId, mode = 'classic' }: { docId: string; mode?: string } = $props()

  let content = $state('')
  let loading = $state(true)

  onMount(async () => {
    try {
      const items = (await db.load(`md-doc`, docId)) as { content: string }[]
      if (items && items.length > 0) {
        content = items[0].content
      }
    } catch {
      // ignore
    } finally {
      loading = false
    }
  })
</script>

{#if loading}
  <Loading position="relative" colorEntity="doc" />
{:else if !content}
  <div style="text-align: center; padding-top: 20px;">
    <p>Impossible de charger le fichier</p>
  </div>
{:else}
  <MdContent {content} {mode} />
{/if}
