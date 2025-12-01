<script lang="ts">
  import { untrack } from 'svelte'
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'
  import type { Variable, MetaVariable } from '@type'

  let {
    datasetVariables: datasetVariablesProp,
    isMeta: isMetaProp = false,
  }: { datasetVariables: (Variable | MetaVariable)[]; isMeta?: boolean } =
    $props()
  const datasetVariables = untrack(() => datasetVariablesProp)
  const isMeta = untrack(() => isMetaProp)

  const metaPath = isMeta ? 'metaVariable' : undefined

  let nbValueMax = 0
  let nbSourcesMax = 0
  let nbDerivedMax = 0
  for (const variable of datasetVariables) {
    nbValueMax = Math.max(nbValueMax, variable.nbValue ?? 0)
    if ('sourceIds' in variable && 'derivedIds' in variable) {
      nbSourcesMax = Math.max(nbSourcesMax, variable.sourceIds?.size ?? 0)
      nbDerivedMax = Math.max(nbDerivedMax, variable.derivedIds?.size ?? 0)
    }
  }

  function defineColumns() {
    const base = [
      Column.name('variable', 'Variable', { isMeta }),
      Column.originalName(),
      Column.description(),
      Column.datatype(),
      Column.isKey(),
      Column.nbSources(nbSourcesMax, 'variable'),
      Column.nbDerived(nbDerivedMax, 'variable'),
      Column.nbMissing(),
      Column.nbDuplicates(),
      Column.freq(),
      Column.nbValues(nbValueMax),
      Column.valuesPreview(),
    ]
    if (isMeta) return [...base, Column.metaLocalisation()]
    return [
      Column.favorite(),
      ...base,
      Column.modality(),
      Column.tag(),
      Column.startDate(),
      Column.endDate(),
    ]
  }

  const columns = defineColumns()
</script>

<Datatable entity="variable" data={datasetVariables} {columns} {metaPath} />
