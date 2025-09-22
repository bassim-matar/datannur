<script lang="ts">
  import db from '@db'
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import TagInfo from '@info-table/TagInfo.svelte'
  import DeepLevelInfo from '@info-table/DeepLevelInfo.svelte'

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
