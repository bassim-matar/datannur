<script lang="ts">
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import type { MetaFolder } from '@type'

  let { metaFolder }: { metaFolder: MetaFolder } = $props()
</script>

<TableWrapper>
  <IdInfo id={metaFolder.id} />
</TableWrapper>
{#if metaFolder.description}
  <DescriptionInfo description={metaFolder.description} />
{/if}
