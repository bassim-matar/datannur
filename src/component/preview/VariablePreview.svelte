<script lang="ts">
  import db from '@db'
  import { tabSelected } from '@lib/store'
  import PreviewManager from '@lib/preview-manager'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'

  let { variable_preview } = $props()

  let variable_data = $state([])
  let columns = $state([])

  let variable = variable_preview.variable
  let dataset_preview: string | null = null

  async function getLoadPreview() {
    if (variable_preview.variable === undefined) {
      variable_data = variable_preview
    } else {
      variable = PreviewManager.cleanKeys(variable)
      dataset_preview = variable_preview.dataset_id
      $tabSelected.nb = 0
      if (typeof dataset_preview !== 'string') {
        let dataset_data = dataset_preview
        variable_data = PreviewManager.getVariableData(dataset_data, variable)
        variable_data = PreviewManager.addPosition(variable_data)
        columns = PreviewManager.getColumns(variable_data)
        $tabSelected.nb = variable_data.length
        return
      }

      if (db.preview === undefined) db.preview = {}
      if (!(dataset_preview in db.preview)) {
        let dataset_data = await PreviewManager.load(dataset_preview)
        PreviewManager.cleanKeys(dataset_data)
        db.preview[dataset_preview] = dataset_data
      }
      variable_data = PreviewManager.getVariableData(
        db.preview[dataset_preview],
        variable,
      )
    }
    columns = PreviewManager.getColumns(variable_data)
    $tabSelected.nb = variable_data.length
  }

  const load_preview = getLoadPreview()
</script>

{#await load_preview}
  <Loading type="tab_body" color_entity="search" />
{:then}
  <Datatable
    entity="preview"
    data={variable_data}
    {columns}
    keep_all_cols={true}
  />
{/await}
