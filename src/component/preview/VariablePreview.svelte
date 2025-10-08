<script lang="ts">
  import { tabSelected } from '@lib/store'
  import PreviewCache from '@lib/preview-cache'
  import PreviewManager from '@lib/preview-manager'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'
  import type { Row, Column } from '@type'

  let { variablePreview } = $props()

  let variableData: Row[] = $state([])
  let columns: Column[] = $state([])

  async function getLoadPreview() {
    // Case 1: variablePreview is already the data
    if (!variablePreview.variable) {
      variableData = variablePreview as Row[]
      columns = PreviewManager.getColumns(variableData)
      $tabSelected.nb = variableData.length
      return
    }

    // Case 2: variablePreview has variable and datasetId
    const variable = PreviewManager.cleanKeys(
      variablePreview.variable,
    ) as string
    const datasetPreview = variablePreview.datasetId

    $tabSelected.nb = 0

    // Case 2a: datasetPreview is already loaded data (not a string ID)
    if (typeof datasetPreview !== 'string') {
      const datasetData = datasetPreview as Row[]
      variableData = PreviewManager.getVariableData(datasetData, variable)
      columns = PreviewManager.getColumns(variableData)
      $tabSelected.nb = variableData.length
      return
    }

    // Case 2b: datasetPreview is a string ID, need to load
    if (!PreviewCache.has(datasetPreview)) {
      const datasetData = (await PreviewManager.load(datasetPreview)) as Row[]
      PreviewManager.cleanKeys(datasetData)
      PreviewCache.set(datasetPreview, datasetData)
    }

    const cachedData = PreviewCache.get(datasetPreview) as Row[]
    variableData = PreviewManager.getVariableData(cachedData, variable)
    columns = PreviewManager.getColumns(variableData)
    $tabSelected.nb = variableData.length
  }

  const loadPreview = getLoadPreview()
</script>

{#await loadPreview}
  <Loading type="tabBody" colorEntity="search" />
{:then}
  <Datatable
    entity="preview"
    data={variableData}
    {columns}
    keepAllCols={true}
  />
{/await}
