<script>
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import TypeInfo from "@infoTable/TypeInfo.svelte"
  import FolderInfo from "@infoTable/FolderInfo.svelte"

  let { modality_info } = $props()
</script>

<TableWrapper>
  <IdInfo id={modality_info.id} />
  <TypeInfo type={modality_info.type_clean} />
  <FolderInfo folder_id={modality_info.folder_id} />
</TableWrapper>
<DescriptionInfo description={modality_info.description} />
