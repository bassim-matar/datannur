<script>
  import db from "@db"
  import Preview_manager from "@js/Preview_manager"
  import Datatable from "@datatable/Datatable.svelte"
  import Loading from "@frame/Loading.svelte"

  export let dataset_preview
  export let nb_item = false
  export let load_first = false

  let dataset_data = false
  let columns = []

  const load_preview = (async () => {
    nb_item = 0
    if (typeof dataset_preview !== "string") {
      dataset_data = dataset_preview
      dataset_data = Preview_manager.add_position(dataset_data)
      columns = Preview_manager.get_columns(dataset_data)
      nb_item = dataset_data.length
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
    nb_item = dataset_data.length
  })()
</script>

{#await load_preview}
  <Loading type="tab_body" color_entity="search" />
{:then}
  {#if dataset_data.length > 0}
    <Datatable
      entity="dataset_preview"
      data={dataset_data}
      sort_by_name={false}
      {columns}
      keep_all_cols={true}
      {load_first}
      bind:nb_item
    />
  {/if}
{/await}
