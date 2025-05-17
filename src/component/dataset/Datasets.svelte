<script>
  import { get_local_filter } from "@js/db"
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { datasets, is_meta = false } = $props()

  const dataset_path = is_meta ? "metaDataset/" : "dataset/"
  const tab_variables = is_meta ? "meta_dataset_variables" : "dataset_variables"
  const meta_path = is_meta ? "metaDataset" : false
  const datasets_sorted = [...datasets]

  function sort_datasets(to_sort) {
    if (to_sort.length === 0) return
    const db_filters = get_local_filter()
    const filter_pos = {}
    for (const i in db_filters) filter_pos[db_filters[i].id] = i
    to_sort.sort(
      (a, b) =>
        filter_pos[a.type] - filter_pos[b.type] ||
        a.folder_name.localeCompare(b.folder_name) ||
        a.name.localeCompare(b.name),
    )
  }
  sort_datasets(datasets_sorted)

  let nb_variable_max = 0
  let nb_row_max = 0
  let nb_doc_max = 0
  for (const dataset of datasets) {
    if (dataset.nb_variable > nb_variable_max) {
      nb_variable_max = dataset.nb_variable
    }
    if (dataset.nb_row > nb_row_max) {
      nb_row_max = dataset.nb_row
    }
    if (dataset.docs_recursive?.length > nb_doc_max) {
      nb_doc_max = dataset.docs_recursive?.length
    }
  }

  function define_columns() {
    const base = [
      Column.name("dataset", "Dataset", { is_meta }),
      Column.description(),
      Column.dataset_type(),
      Column.nb_variable("dataset", nb_variable_max, {
        tab: tab_variables,
        link_path: dataset_path,
        show_title: true,
      }),
      Column.nb_row(nb_row_max),
    ]
    if (is_meta) {
      return [
        ...base,
        Column.meta_localisation(),
        Column.metaFolder(),
        Column.last_update_timestamp(),
      ]
    }
    return [
      Column.favorite(),
      ...base,
      Column.nb_doc("dataset", nb_doc_max, true),
      Column.folder(),
      Column.tag(),
      Column.last_update(),
      Column.next_update(),
      Column.frequency(),
      Column.start_date(),
      Column.end_date(),
      Column.owner(),
      Column.manager(),
      Column.localisation(),
      Column.delivery_format(),
      Column.data_path(),
    ]
  }
  const columns = define_columns()
</script>

<Datatable entity="dataset" data={datasets_sorted} {columns} {meta_path} />
