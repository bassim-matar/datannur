<script>
  import Icon from "@layout/Icon.svelte"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import DocPreview from "./DocPreview.svelte"
  import LastUpdateInfo from "@infoTable/LastUpdateInfo.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"

  let { doc_info } = $props()
</script>

<TableWrapper>
  <IdInfo id={doc_info.id} />
  <tr>
    <td><Icon type="type" /> Type</td>
    <td>{doc_info.type} <Icon type={doc_info.type} /></td>
  </tr>
  <tr>
    <td><Icon type="link" /> Lien</td>
    <td
      ><a class="break_line" href={doc_info.path} target="_blanck"
        >{doc_info.path}</a
      ></td
    >
  </tr>
  <LastUpdateInfo
    last_update_date={doc_info.last_update}
    intraday={true}
    from_timestamp={true}
  />
  <DescriptionInfo description={doc_info.description} inside_table={true} />
</TableWrapper>

<DocPreview doc={doc_info} />
