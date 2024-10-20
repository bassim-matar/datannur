<script>
  import db from "@db"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import TagInfo from "@infoTable/TagInfo.svelte"
  import DeepLevelInfo from "@infoTable/DeepLevelInfo.svelte"

  export let tag_info
</script>

<TableWrapper>
  <IdInfo id={tag_info.id} />
  {#if db.use.tag_recursive}
    <DeepLevelInfo level={tag_info.parents.length + 1} />
    {#if tag_info.parents.length}
      <TagInfo tag_id={tag_info.id} is_self={true} />
    {/if}
  {/if}
</TableWrapper>
<DescriptionInfo description={tag_info.description} />
