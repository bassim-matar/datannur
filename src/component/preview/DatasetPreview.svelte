<script>
  import db from "@db"
  import { tab_selected } from "@js/store"
  import Preview_manager from "@js/Preview_manager"
  import Datatable from "@datatable/Datatable.svelte"
  import Loading from "@frame/Loading.svelte"

  let { dataset_preview } = $props()

  let dataset_data = $state(false)
  let columns = $state([])

  async function get_load_preview() {
    $tab_selected.nb = 0
    if (typeof dataset_preview !== "string") {
      dataset_data = dataset_preview
      dataset_data = Preview_manager.add_position(dataset_data)
      columns = Preview_manager.get_columns(dataset_data)
      $tab_selected.nb = dataset_data.length
      return
    }

    if (db.preview === undefined) db.preview = {}
    if (!(dataset_preview in db.preview)) {
      dataset_data = await Preview_manager.load(dataset_preview)
      Preview_manager.clean_keys(dataset_data)
      db.preview[dataset_preview] = [...dataset_data]
    }
    dataset_data = db.preview[dataset_preview]
    dataset_data = dataset_data.map(obj => {
      delete obj._row_num
      return obj
    })
    columns = Preview_manager.get_columns(dataset_data)
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
