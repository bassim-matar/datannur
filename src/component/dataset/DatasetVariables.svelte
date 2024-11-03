<script>
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { dataset_variables, is_meta = false } = $props()

  let nb_value_max = 0
  for (const variable of dataset_variables) {
    nb_value_max = Math.max(nb_value_max, variable.nb_value)
  }

  function define_columns() {
    const columns = [
      Column.name("variable", "Variable", { is_meta }),
      Column.original_name(),
      Column.description(),
      Column.datatype(),
      Column.nb_missing(),
      Column.nb_duplicates(),
      Column.nb_values(nb_value_max),
      Column.values_preview()
    ]
    return is_meta ? columns : columns.concat([
      Column.dataset(),
      Column.folder(),
      Column.owner(),
      Column.manager(),
      Column.tag(),
      Column.start_date(),
      Column.end_date(),
      Column.favorite(),
    ])
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
