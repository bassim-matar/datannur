<script>
  import { get_local_filter } from "@js/db"
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { variables, is_meta = false } = $props()

  const variables_sorted = [...variables]
  const parent_name = is_meta ? "metaDataset" : "dataset"
  const meta_path = is_meta ? "metaVariable/" : false

  function sort_variables(to_sort) {
    if (to_sort.length === 0) return
    const db_filters = get_local_filter()
    const filter_pos = {}
    for (const i in db_filters) filter_pos[db_filters[i].id] = i
    to_sort.sort(
      (a, b) =>
        filter_pos[a.dataset_type] - filter_pos[b.dataset_type] ||
        a.folder_name.localeCompare(b.folder_name) ||
        a.dataset_name.localeCompare(b.dataset_name) ||
        a.num - b.num,
    )
  }
  sort_variables(variables_sorted)

  let nb_row_max = 0
  let nb_value_max = 0
  for (const variable of variables) {
    nb_row_max = Math.max(nb_row_max, variable.nb_row)
    nb_value_max = Math.max(nb_value_max, variable.nb_value)
  }

  function define_columns() {
    const base = [
      Column.name("variable", "Variable", { is_meta }),
      Column.original_name(),
      Column.description(),
      Column.datatype(),
      Column.is_key(),
      Column.nb_row(nb_row_max),
      Column.nb_missing(),
      Column.nb_duplicates(),
      Column.nb_values(nb_value_max),
      Column.values_preview(),
    ]
    if (is_meta) {
      return [...base, Column.dataset(parent_name), Column.metaFolder()]
    }
    return [
      Column.favorite(),
      ...base,
      Column.modality(),
      Column.dataset(parent_name),
      Column.folder(),
      Column.owner(),
      Column.manager(),
      Column.tag(),
      Column.start_date(),
      Column.end_date(),
    ]
  }
  const columns = define_columns()
</script>

<Datatable entity="variable" data={variables_sorted} {columns} {meta_path} />
