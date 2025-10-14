<script lang="ts">
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import TypeInfo from '@info-table/TypeInfo.svelte'
  import FolderInfo from '@info-table/FolderInfo.svelte'
  import type { Modality } from '@type'

  let { modality }: { modality: Modality } = $props()
</script>

<TableWrapper>
  <IdInfo id={modality.id} />
  <TypeInfo type={modality.typeClean} />
  <FolderInfo folderId={modality.folderId} />
</TableWrapper>
{#if modality.description}
  <DescriptionInfo description={modality.description} />
{/if}
