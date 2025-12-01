<script lang="ts">
  import { untrack } from 'svelte'
  import { getLocalFilter } from '@lib/db'
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'
  import type { Dataset } from '@type'

  let {
    datasets: datasetsProp,
    isMeta: isMetaProp = false,
  }: { datasets: Dataset[]; isMeta?: boolean } = $props()

  const datasets = untrack(() => datasetsProp)
  const isMeta = untrack(() => isMetaProp)

  const datasetPath = isMeta ? 'metaDataset/' : 'dataset/'
  const tabVariables = isMeta ? 'metaDatasetVariables' : 'datasetVariables'
  const metaPath = isMeta ? 'metaDataset' : undefined
  const datasetsSorted = [...datasets]

  function sortDatasets(toSort: Dataset[]) {
    if (toSort.length === 0) return
    const dbFilters = getLocalFilter()
    const filterPos: { [key: string]: number } = {}
    dbFilters.forEach((filter, i) => (filterPos[filter.id] = i))
    toSort.sort(
      (a, b) =>
        (b.lineageType ?? '').localeCompare(a.lineageType ?? '') ||
        (filterPos[a.type ?? ''] ?? 0) - (filterPos[b.type ?? ''] ?? 0) ||
        (a.folderName ?? '').localeCompare(b.folderName ?? '') ||
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
    if (dataset.nbVariable ?? 0 > nbVariableMax) {
      nbVariableMax = dataset.nbVariable ?? 0
    }
    if (dataset.nbRow ?? 0 > nbRowMax) {
      nbRowMax = dataset.nbRow ?? 0
    }
    if (dataset.docsRecursive?.length ?? 0 > nbDocMax) {
      nbDocMax = dataset.docsRecursive?.length ?? 0
    }
    if (dataset.sourceIds?.size ?? 0 > nbSourcesMax) {
      nbSourcesMax = dataset.sourceIds?.size ?? 0
    }
    if (dataset.derivedIds?.size ?? 0 > nbDerivedMax) {
      nbDerivedMax = dataset.derivedIds?.size ?? 0
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
          varName: 'lastUpdateTimestamp',
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
