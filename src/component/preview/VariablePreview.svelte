<script lang="ts">
  import { tabSelected } from '@lib/store'
  import PreviewCache from '@lib/preview-cache'
  import PreviewManager from '@lib/preview-manager'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'
  import type { Row, Column } from '@type'

  let {
    variablePreview,
  }: {
    variablePreview:
      | Record<string, unknown>[]
      | { variable: string; datasetId: string }
  } = $props()

  let variableData: Row[] = $state([])
  let columns: Column[] = $state([])

  async function getLoadPreview() {
    // Case 1: variablePreview is already the data
    if (!('variable' in variablePreview)) {
      variableData = variablePreview as Row[]
      columns = PreviewManager.getColumns(variableData)
      $tabSelected.nb = variableData.length
      return
    }

    // Case 2: variablePreview has variable and datasetId to load
    const variable = PreviewManager.cleanKey(variablePreview.variable)
    const datasetId = variablePreview.datasetId

    $tabSelected.nb = 0

    if (!PreviewCache.has(datasetId)) {
      const datasetData = await PreviewManager.load(datasetId)
      PreviewManager.cleanKeys(datasetData)
      PreviewCache.set(datasetId, datasetData)
    }

    const cachedData = PreviewCache.get(datasetId) as Row[]
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
