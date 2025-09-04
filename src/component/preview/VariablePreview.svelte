<script lang="ts">
  import db from "@db"
  import { tab_selected } from "@js/store"
  import Preview_manager from "@js/Preview_manager"
  import Datatable from "@datatable/Datatable.svelte"
  import Loading from "@frame/Loading.svelte"

  let { variable_preview } = $props()

  let variable_data = $state([])
  let columns = $state([])

  let variable = variable_preview.variable
  let dataset_preview: string | any = false

  async function get_load_preview() {
    if (variable_preview.variable === undefined) {
      variable_data = variable_preview
    } else {
      variable = Preview_manager.clean_keys(variable)
      dataset_preview = variable_preview.dataset_id
      $tab_selected.nb = 0
      if (typeof dataset_preview !== "string") {
        let dataset_data = dataset_preview
        variable_data = Preview_manager.get_variable_data(
          dataset_data,
          variable,
        )
        variable_data = Preview_manager.add_position(variable_data)
        columns = Preview_manager.get_columns(variable_data)
        $tab_selected.nb = variable_data.length
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
        variable,
      )
    }
    columns = Preview_manager.get_columns(variable_data)
    $tab_selected.nb = variable_data.length
  }

  const load_preview = get_load_preview()
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
