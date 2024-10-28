<script>
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { dataset_variables, is_meta = false } = $props()

  function define_columns() {
    let columns = [
      Column.name("variable", "Variable", { is_meta }),
      Column.original_name(),
      Column.description(),
      Column.datatype(),
      Column.nb_missing(),
      Column.nb_duplicates(),
    ]

    columns.push(Column.nb_values())
    columns.push(Column.values_preview())

    if (!is_meta) {
      columns = columns.concat([
        Column.modality(),
        Column.tag(),
        Column.start_date(),
        Column.end_date(),
        Column.favorite(),
      ])
    }
    return columns
  }

  const columns = define_columns()
</script>

{#if dataset_variables.length > 0}
  <Datatable
    entity="variable"
    data={dataset_variables}
    sort_by_name={false}
    {columns}
    meta_path={is_meta ? "metaVariable/" : false}
  />
{/if}
