<script>
  import { onMount } from "svelte"
  import db from "@db"
  import MdContent from "@layout/MdContent.svelte"
  import Loading from "@frame/Loading.svelte"

  let { doc_id } = $props()

  let content = $state()
  let loading = $state(true)

  onMount(async () => {
    try {
      const items = await db.load(`md_doc`, doc_id)
      if (items && items.length > 0) {
        content = items[0].content
      }
    } catch (error) {
    } finally {
      loading = false
    }
  })
</script>

{#if loading}
  <Loading position="relative" color_entity="doc" />
{:else if !content}
  <div style="text-align: center; padding-top: 20px;">
    <p>Impossible de charger le fichier</p>
  </div>
{:else}
  <MdContent {content} />
{/if}
