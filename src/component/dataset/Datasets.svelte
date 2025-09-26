<script lang="ts">
  import { getLocalFilter } from '@lib/db'
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { datasets, isMeta = false } = $props()

  const datasetPath = isMeta ? 'metaDataset/' : 'dataset/'
  const tabVariables = isMeta ? 'metaDatasetVariables' : 'datasetVariables'
  const metaPath = isMeta ? 'metaDataset' : null
  const datasetsSorted = [...datasets]

  function sortDatasets(toSort) {
    if (toSort.length === 0) return
    const dbFilters = getLocalFilter()
    const filterPos = {}
    for (const i in dbFilters) filterPos[dbFilters[i].id] = i
    toSort.sort(
      (a, b) =>
        b.lineageType?.localeCompare(a.lineageType) ||
        filterPos[a.type] - filterPos[b.type] ||
        a.folder_name.localeCompare(b.folder_name) ||
        a.name.localeCompare(b.name),
    )
  }
  sortDatasets(datasetsSorted)

  let nbVariableMax = 0
  let nbRowMax = 0
  let nbDocMax = 0
  let nbSourcesMax = 0
  let nbDerivedMax = 0
  for (const dataset of datasets) {
    if (dataset.nb_variable > nbVariableMax) {
      nbVariableMax = dataset.nb_variable
    }
    if (dataset.nb_row > nbRowMax) {
      nbRowMax = dataset.nb_row
    }
    if (dataset.docs_recursive?.length > nbDocMax) {
      nbDocMax = dataset.docs_recursive?.length
    }
    if (dataset.source_ids?.size > nbSourcesMax) {
      nbSourcesMax = dataset.source_ids.size
    }
    if (dataset.derived_ids?.size > nbDerivedMax) {
      nbDerivedMax = dataset.derived_ids.size
    }
  }

  function defineColumns() {
    const base = [
      Column.name('dataset', 'Dataset', { isMeta }),
      Column.description(),
      Column.lineageType(),
      Column.nbSources(nbSourcesMax, 'dataset'),
      Column.nbDerived(nbDerivedMax, 'dataset'),
      Column.datasetType(),
      Column.nbVariable('dataset', nbVariableMax, {
        tab: tabVariables,
        linkPath: datasetPath,
        showTitle: true,
      }),
      Column.nbRow(nbRowMax),
    ]
    if (isMeta) {
      return [
        ...base,
        Column.metaLocalisation(),
        Column.metaFolder(),
        Column.timestamp({
          varName: 'last_update_timestamp',
          title: 'Mise à jour',
          tooltip: 'Moment de la dernière mise à jour',
        }),
      ]
    }
    return [
      Column.favorite(),
      ...base,
      Column.nbDoc('dataset', nbDocMax, true),
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
  const columns = defineColumns()
</script>

<Datatable entity="dataset" data={datasetsSorted} {columns} {metaPath} />
