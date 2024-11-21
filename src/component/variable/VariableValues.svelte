<script>
  import Render from "@js/Render"
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"
  import { link } from "@js/util"

  let { variable_values, is_meta = false } = $props()

  let has_description = false
  for (const value of variable_values) {
    if (value.description) {
      has_description = true
      break
    }
  }

  function define_columns() {
    const columns = []
    if (!is_meta) {
      columns.push({
        data: "modality_name",
        title: Render.icon("modality") + "modalité",
        tooltip: "Modalité",
        render: (data, _, row) => link("modality/" + row.modality_id, data),
      })
    }
    columns.push(Column.value())
    if (has_description) columns.push(Column.description())
    return columns
  }
  const columns = define_columns()
</script>

{#if variable_values.length > 0}
  <Datatable
    entity="value"
    data={variable_values}
    {columns}
    keep_all_cols={true}
  />
{/if}
