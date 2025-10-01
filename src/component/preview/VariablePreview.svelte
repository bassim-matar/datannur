<script lang="ts">
  import { tabSelected } from '@lib/store'
  import PreviewCache from '@lib/preview-cache'
  import PreviewManager from '@lib/preview-manager'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'

  let { variablePreview } = $props()

  let variableData = $state([])
  let columns = $state([])

  let variable = variablePreview.variable
  let datasetPreview: string | null = null

  async function getLoadPreview() {
    if (variablePreview.variable === undefined) {
      variableData = variablePreview
    } else {
      variable = PreviewManager.cleanKeys(variable)
      datasetPreview = variablePreview.dataset_id
      $tabSelected.nb = 0
      if (typeof datasetPreview !== 'string') {
        let datasetData = datasetPreview
        variableData = PreviewManager.getVariableData(datasetData, variable)
        columns = PreviewManager.getColumns(variableData)
        $tabSelected.nb = variableData.length
        return
      }

      if (!PreviewCache.has(datasetPreview)) {
        let datasetData = await PreviewManager.load(datasetPreview)
        PreviewManager.cleanKeys(datasetData)
        PreviewCache.set(datasetPreview, datasetData)
      }
      variableData = PreviewManager.getVariableData(
        PreviewCache.get(datasetPreview)!,
        variable,
      )
    }
    columns = PreviewManager.getColumns(variableData)
    $tabSelected.nb = variableData.length
  }

  const loadPreview = getLoadPreview()
</script>

{#await loadPreview}
  <Loading type="tab_body" colorEntity="search" />
{:then}
  <Datatable
    entity="preview"
    data={variableData}
    {columns}
    keepAllCols={true}
  />
{/await}
