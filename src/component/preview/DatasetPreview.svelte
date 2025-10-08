<script lang="ts">
  import { tabSelected } from '@lib/store'
  import PreviewCache from '@lib/preview-cache'
  import PreviewManager from '@lib/preview-manager'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'
  import type { Row, Column } from '@type'

  let { datasetPreview } = $props()

  let datasetData: Row[] = $state([])
  let columns: Column[] = $state([])

  async function getLoadPreview() {
    $tabSelected.nb = 0

    // Case 1: datasetPreview is already loaded data (not a string ID)
    if (typeof datasetPreview !== 'string') {
      datasetData = datasetPreview as Row[]
      columns = PreviewManager.getColumns(datasetData)
      $tabSelected.nb = datasetData.length
      return
    }

    // Case 2: datasetPreview is a string ID, need to load
    if (!PreviewCache.has(datasetPreview)) {
      const loadedData = (await PreviewManager.load(datasetPreview)) as Row[]
      PreviewManager.cleanKeys(loadedData)
      PreviewCache.set(datasetPreview, [...loadedData])
    }

    const cachedData = PreviewCache.get(datasetPreview) as Row[]
    // Remove _rowNum property from each row
    datasetData = cachedData.map(obj => {
      const { _rowNum: rowNum, ...rest } = obj
      void rowNum
      return rest
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
