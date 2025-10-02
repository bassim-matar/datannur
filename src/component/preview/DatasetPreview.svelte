<script lang="ts">
  import { tabSelected } from '@lib/store'
  import PreviewCache from '@lib/preview-cache'
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
      columns = PreviewManager.getColumns(datasetData)
      $tabSelected.nb = datasetData.length
      return
    }

    if (!PreviewCache.has(datasetPreview)) {
      datasetData = await PreviewManager.load(datasetPreview)
      PreviewManager.cleanKeys(datasetData)
      PreviewCache.set(datasetPreview, [...datasetData])
    }
    datasetData = PreviewCache.get(datasetPreview)!
    datasetData = datasetData.map(obj => {
      delete obj._rowNum
      return obj
    })
    columns = PreviewManager.getColumns(datasetData)
    $tabSelected.nb = datasetData.length
  }

  const loadPreview = getLoadPreview()
</script>

{#await loadPreview}
  <Loading type="tabBody" colorEntity="search" />
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
