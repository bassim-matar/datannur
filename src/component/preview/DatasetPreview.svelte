<script lang="ts">
  import db from '@db'
  import { tab_selected } from '@lib/store'
  import PreviewManager from '@lib/preview-manager'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'

  let { dataset_preview } = $props()

  let dataset_data = $state([])
  let columns = $state([])

  async function get_load_preview() {
    $tab_selected.nb = 0
    if (typeof dataset_preview !== 'string') {
      dataset_data = dataset_preview
      dataset_data = PreviewManager.add_position(dataset_data)
      columns = PreviewManager.get_columns(dataset_data)
      $tab_selected.nb = dataset_data.length
      return
    }

    if (db.preview === undefined) db.preview = {}
    if (!(dataset_preview in db.preview)) {
      dataset_data = await PreviewManager.load(dataset_preview)
      PreviewManager.clean_keys(dataset_data)
      db.preview[dataset_preview] = [...dataset_data]
    }
    dataset_data = db.preview[dataset_preview] as any[]
    dataset_data = dataset_data.map(obj => {
      delete obj._row_num
      return obj
    })
    columns = PreviewManager.get_columns(dataset_data)
    $tab_selected.nb = dataset_data.length
  }

  const load_preview = get_load_preview()
</script>

{#await load_preview}
  <Loading type="tab_body" color_entity="search" />
{:then}
  {#if dataset_data.length > 0}
    <Datatable
      entity="preview"
      data={dataset_data}
      {columns}
      keep_all_cols={true}
    />
  {/if}
{/await}
