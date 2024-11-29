<script>
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import TypeInfo from "@infoTable/TypeInfo.svelte"
  import FolderInfo from "@infoTable/FolderInfo.svelte"

  let { modality } = $props()
</script>

<TableWrapper>
  <IdInfo id={modality.id} />
  <TypeInfo type={modality.type_clean} />
  <FolderInfo folder_id={modality.folder_id} />
</TableWrapper>
<DescriptionInfo description={modality.description} />
