<script lang="ts">
  import { get_local_filter } from '@lib/db'
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { datasets, is_meta = false } = $props()

  const dataset_path = is_meta ? 'metaDataset/' : 'dataset/'
  const tab_variables = is_meta ? 'meta_dataset_variables' : 'dataset_variables'
  const meta_path = is_meta ? 'metaDataset' : null
  const datasets_sorted = [...datasets]

  function sort_datasets(to_sort) {
    if (to_sort.length === 0) return
    const db_filters = get_local_filter()
    const filter_pos = {}
    for (const i in db_filters) filter_pos[db_filters[i].id] = i
    to_sort.sort(
      (a, b) =>
        b.lineage_type?.localeCompare(a.lineage_type) ||
        filter_pos[a.type] - filter_pos[b.type] ||
        a.folder_name.localeCompare(b.folder_name) ||
        a.name.localeCompare(b.name),
    )
  }
  sort_datasets(datasets_sorted)

  let nb_variable_max = 0
  let nb_row_max = 0
  let nb_doc_max = 0
  let nb_sources_max = 0
  let nb_derived_max = 0
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
    if (dataset.source_ids?.size > nb_sources_max) {
      nb_sources_max = dataset.source_ids.size
    }
    if (dataset.derived_ids?.size > nb_derived_max) {
      nb_derived_max = dataset.derived_ids.size
    }
  }

  function define_columns() {
    const base = [
      Column.name('dataset', 'Dataset', { is_meta }),
      Column.description(),
      Column.lineageType(),
      Column.nbSources(nb_sources_max, 'dataset'),
      Column.nbDerived(nb_derived_max, 'dataset'),
      Column.datasetType(),
      Column.nbVariable('dataset', nb_variable_max, {
        tab: tab_variables,
        link_path: dataset_path,
        show_title: true,
      }),
      Column.nbRow(nb_row_max),
    ]
    if (is_meta) {
      return [
        ...base,
        Column.metaLocalisation(),
        Column.metaFolder(),
        Column.timestamp({
          var_name: 'last_update_timestamp',
          title: 'Mise à jour',
          tooltip: 'Moment de la dernière mise à jour',
        }),
      ]
    }
    return [
      Column.favorite(),
      ...base,
      Column.nbDoc('dataset', nb_doc_max, true),
      Column.folder(),
      Column.tag(),
      Column.lastUpdate(),
      Column.nextUpdate(),
      Column.frequency(),
      Column.startDate(),
      Column.endDate(),
      Column.owner(),
      Column.manager(),
      Column.localisation(),
      Column.deliveryFormat(),
      Column.dataPath(),
    ]
  }
  const columns = define_columns()
</script>

<Datatable entity="dataset" data={datasets_sorted} {columns} {meta_path} />
