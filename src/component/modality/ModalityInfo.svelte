<script lang="ts">
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import TypeInfo from '@info-table/TypeInfo.svelte'
  import FolderInfo from '@info-table/FolderInfo.svelte'

  let { modality } = $props()
</script>

<TableWrapper>
  <IdInfo id={modality.id} />
  <TypeInfo type={modality.type_clean} />
  <FolderInfo folder_id={modality.folder_id} />
</TableWrapper>
<DescriptionInfo description={modality.description} />
