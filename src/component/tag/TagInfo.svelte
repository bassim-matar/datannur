<script lang="ts">
  import db from "@db"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import TagInfo from "@infoTable/TagInfo.svelte"
  import DeepLevelInfo from "@infoTable/DeepLevelInfo.svelte"

  let { tag } = $props()
</script>

<TableWrapper>
  <IdInfo id={tag.id} />
  {#if db.use.tag_recursive}
    <DeepLevelInfo level={tag.parents.length + 1} />
    {#if tag.parents.length}
      <TagInfo tag_id={tag.id} />
    {/if}
  {/if}
</TableWrapper>
<DescriptionInfo description={tag.description} />
