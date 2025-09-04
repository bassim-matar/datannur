<script lang="ts">
  import Icon from "@layout/Icon.svelte"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import DocPreview from "./DocPreview.svelte"
  import LastUpdateInfo from "@infoTable/LastUpdateInfo.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"

  let { doc } = $props()
</script>

<TableWrapper>
  <IdInfo id={doc.id} />
  <tr>
    <td><Icon type="type" /> Type</td>
    <td>{doc.type} <Icon type={doc.type} /></td>
  </tr>
  <tr>
    <td><Icon type="link" /> Lien</td>
    <td>
      <a class="break_line" href={doc.path} target="_blanck">{doc.path}</a>
    </td>
  </tr>
  <LastUpdateInfo
    last_update_date={doc.last_update}
    intraday={true}
    from_timestamp={true}
  />
  <DescriptionInfo description={doc.description} inside_table={true} />
</TableWrapper>

<DocPreview {doc} />
