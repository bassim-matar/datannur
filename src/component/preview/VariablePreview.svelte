<script>
  import db from "@db"
  import Preview_manager from "@js/Preview_manager"
  import Datatable from "@datatable/Datatable.svelte"
  import Loading from "@frame/Loading.svelte"

  export let variable_preview
  export let nb_item = false
  export let load_first = false

  let variable = variable_preview.variable
  let dataset_preview = false
  let variable_data = false
  let columns = []

  const load_preview = (async () => {
    if (variable_preview.variable === undefined) {
      variable_data = variable_preview
    } else {
      variable = Preview_manager.clean_keys(variable)
      dataset_preview = variable_preview.dataset_id
      nb_item = 0
      if (typeof dataset_preview !== "string") {
        let dataset_data = dataset_preview
        variable_data = Preview_manager.get_variable_data(
          dataset_data,
          variable
        )
        variable_data = Preview_manager.add_position(variable_data)
        columns = Preview_manager.get_columns(variable_data)
        nb_item = variable_data.length
        return
      }

      if (db.preview === undefined) db.preview = {}
      if (!(dataset_preview in db.preview)) {
        let dataset_data = await Preview_manager.load(dataset_preview)
        Preview_manager.clean_keys(dataset_data)
        db.preview[dataset_preview] = dataset_data
      }
      variable_data = Preview_manager.get_variable_data(
        db.preview[dataset_preview],
        variable
      )
    }
    columns = Preview_manager.get_columns(variable_data)
    nb_item = variable_data.length
  })()
</script>

{#await load_preview}
  <Loading type="tab_body" color_entity="search"/>
{:then load_preview}
  <Datatable
    entity="variable_preview"
    data={variable_data}
    sort_by_name={false}
    {columns}
    keep_all_cols={true}
    {load_first}
    bind:nb_item
  />
{/await}
