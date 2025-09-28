<script lang="ts">
  import { tabSelected, previewCache } from '@lib/store'
  import PreviewManager from '@lib/preview-manager'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'

  let { datasetPreview } = $props()

  let datasetData = $state([])
  let columns = $state([])

  async function getLoadPreview() {
    $tabSelected.nb = 0
    if (typeof datasetPreview !== 'string') {
      datasetData = datasetPreview
      datasetData = PreviewManager.addPosition(datasetData)
      columns = PreviewManager.getColumns(datasetData)
      $tabSelected.nb = datasetData.length
      return
    }

    if (!(datasetPreview in $previewCache)) {
      datasetData = await PreviewManager.load(datasetPreview)
      PreviewManager.cleanKeys(datasetData)
      $previewCache[datasetPreview] = [...datasetData]
    }
    datasetData = $previewCache[datasetPreview]
    datasetData = datasetData.map(obj => {
      delete obj._row_num
      return obj
    })
    columns = PreviewManager.getColumns(datasetData)
    $tabSelected.nb = datasetData.length
  }

  const loadPreview = getLoadPreview()
</script>

{#await loadPreview}
  <Loading type="tab_body" colorEntity="search" />
{:then}
  {#if datasetData.length > 0}
    <Datatable
      entity="preview"
      data={datasetData}
      {columns}
      keepAllCols={true}
    />
  {/if}
{/await}
