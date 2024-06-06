<script>
  import db from "@db"
  import MdContent from "@layout/MdContent.svelte"
  import Loading from "@frame/Loading.svelte"

  export let entity = "folder"
  export let readme
  let content
  let loading = true

  ;(async () => {
    const items = await db.load(`../../md/${entity}/`, readme)
    if (items && items.length > 0) content = items[0].content
    loading = false
  })()
</script>

{#if loading}
  <Loading position="relative" color_entity="doc" />
{:else}
  <MdContent {content} />
{/if}
