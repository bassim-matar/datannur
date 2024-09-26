<script>
  import db from "@db"
  import { link, get_percent } from "@js/util"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import Datatable from "@datatable/Datatable.svelte"
  import CopyText from "@src/layout/CopyText.svelte"

  export let datasets
  export let is_meta = false
  export let nb_item = false
  export let load_first = false

  let dataset_path = "dataset/"
  let tab_variables = "dataset_variables"
  if (is_meta) {
    dataset_path = "metaDataset/"
    tab_variables = "meta_" + tab_variables
  }

  const datasets_sorted = [...datasets]

  function sort_dataset(to_sort) {
    if (to_sort.length === 0) return

    const by_name = (a, b) => a.name.localeCompare(b.name)
    const by_folder = (a, b) =>
      a.folder_name.localeCompare(b.folder_name) || by_name(a, b)

    if (is_meta) {
      const by_metaFolder = (a, b) =>
        a.metaFolder_id.localeCompare(b.metaFolder_id) || by_name(a, b)
      to_sort.sort(by_metaFolder)
      return
    }

    if (!to_sort[0].hasOwnProperty("type")) {
      to_sort.sort(db.use.folder ? by_folder : by_name)
      return
    }

    const filters = db.get_all("filter")
    const filter_pos = {}
    for (const i in filters) filter_pos[filters[i].id] = i
    const by_type = (a, b) => filter_pos[a.type] - filter_pos[b.type]

    if (db.use.folder) {
      to_sort.sort((a, b) => by_type(a, b) || by_folder(a, b))
    } else {
      to_sort.sort((a, b) => by_type(a, b) || by_name(a, b))
    }
  }

  sort_dataset(datasets_sorted)

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
    if (dataset.nb_doc > nb_doc_max) {
      nb_doc_max = dataset.nb_doc
    }
  }

  let columns = []
  if (!is_meta) {
    columns.push(Column.favorite())
  }
  columns = columns.concat([
    Column.name("dataset", "Dataset", { is_meta }),
    Column.description(),
    Column.datatype(),
    Column.nb_variable("dataset", nb_variable_max, {
      tab: tab_variables,
      link_path: dataset_path,
      show_title: true,
    }),
    Column.nb_row(nb_row_max),
  ])

  if (is_meta) columns.push(Column.metaFolder())

  if (!is_meta) {
    columns = columns.concat([
      Column.nb_doc("dataset", nb_doc_max, true),
      Column.folder(),
      Column.tag(),
      Column.owner(),
      Column.manager(),
      Column.localisation(),
      Column.delivery_format(),
      Column.frequency(),
      Column.last_update(),
      Column.period(),
      Column.data_path(),
    ])
  }
</script>

{#if datasets.length > 0}
  <Datatable
    entity="dataset"
    data={datasets_sorted}
    {columns}
    sort_by_name={false}
    {load_first}
    meta_path={is_meta ? dataset_path : false}
    bind:nb_item
  />
{/if}
