<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import DocPreview from './DocPreview.svelte'
  import LastUpdateInfo from '@info-table/LastUpdateInfo.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'

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
    lastUpdateDate={doc.last_update}
    intraday={true}
    fromTimestamp={true}
  />
  <DescriptionInfo description={doc.description} insideTable={true} />
</TableWrapper>

<DocPreview {doc} />
