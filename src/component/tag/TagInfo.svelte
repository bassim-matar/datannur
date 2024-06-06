<script>
  import db from "@db"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import TagInfo from "@infoTable/TagInfo.svelte"

  export let tag_info
</script>

<TableWrapper>
  <IdInfo id={tag_info.id} />
  {#if db.use.tag_recursive}
    <TagInfo tag_id={tag_info.id} is_self={true} />
  {/if}
</TableWrapper>
<DescriptionInfo description={tag_info.description} />
