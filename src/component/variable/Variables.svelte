<script lang="ts">
  import { getLocalFilter } from '@lib/db'
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { variables, isMeta = false } = $props()

  const variablesSorted = [...variables]
  const parentName = isMeta ? 'metaDataset' : 'dataset'
  const metaPath = isMeta ? 'metaVariable/' : false

  function sortVariables(toSort) {
    if (toSort.length === 0) return
    const dbFilters = getLocalFilter()
    const filterPos = {}
    for (const i in dbFilters) filterPos[dbFilters[i].id] = i
    toSort.sort(
      (a, b) =>
        b.lineageType?.localeCompare(a.lineageType) ||
        filterPos[a.dataset_type] - filterPos[b.dataset_type] ||
        a.folder_name.localeCompare(b.folder_name) ||
        a.dataset_name.localeCompare(b.dataset_name) ||
        a.num - b.num,
    )
  }
  sortVariables(variablesSorted)

  let nbRowMax = 0
  let nbValueMax = 0
  let nbSourcesMax = 0
  let nbDerivedMax = 0
  for (const variable of variables) {
    nbRowMax = Math.max(nbRowMax, variable.nb_row)
    nbValueMax = Math.max(nbValueMax, variable.nb_value)
    nbSourcesMax = Math.max(nbSourcesMax, variable.source_ids?.length || 0)
    nbDerivedMax = Math.max(nbDerivedMax, variable.derived_ids?.length || 0)
  }

  function defineColumns() {
    const base = [
      Column.name('variable', 'Variable', { isMeta }),
      Column.originalName(),
      Column.description(),
      Column.datatype(),
      Column.isKey(),
      Column.lineageType(),
      Column.nbSources(nbSourcesMax, 'variable'),
      Column.nbDerived(nbDerivedMax, 'variable'),
      Column.nbRow(nbRowMax),
      Column.nbMissing(),
      Column.nbDuplicates(),
      Column.nbValues(nbValueMax),
      Column.freq(),
      Column.valuesPreview(),
    ]
    if (isMeta) {
      return [
        ...base,
        Column.metaLocalisation(),
        Column.dataset(parentName),
        Column.metaFolder(),
      ]
    }
    return [
      Column.favorite(),
      ...base,
      Column.modality(),
      Column.dataset(parentName),
      Column.folder(),
      Column.owner(),
      Column.manager(),
      Column.tag(),
      Column.startDate(),
      Column.endDate(),
    ]
  }
  const columns = defineColumns()
</script>

<Datatable entity="variable" data={variablesSorted} {columns} {metaPath} />
