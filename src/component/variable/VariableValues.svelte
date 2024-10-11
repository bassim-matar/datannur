<script>
  import Render from "@js/Render"
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"
  import { link } from "@js/util"

  export let variable_values
  export let nb_item
  export let load_first = false
  export let is_meta = false

  const has = {}
  for (const value of variable_values) {
    if (value.description) has.description = true
  }

  const columns = []

  if (!is_meta) {
    columns.push({
      data: "modality_name",
      title: Render.icon("modality") + "modalité",
      render: (data, _, row) => link("modality/" + row.modality_id, data),
    })
  }
  columns.push(Column.value())
  if (has.description) columns.push(Column.description())
</script>

{#if variable_values.length > 0}
  <Datatable
    entity="value"
    data={variable_values}
    {load_first}
    {columns}
    bind:nb_item
    keep_all_cols={true}
  />
{/if}
