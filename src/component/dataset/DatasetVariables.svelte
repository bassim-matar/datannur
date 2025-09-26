<script lang="ts">
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { datasetVariables, isMeta = false } = $props()

  const metaPath = isMeta ? 'metaVariable' : false

  let nbValueMax = 0
  let nbSourcesMax = 0
  let nbDerivedMax = 0
  for (const variable of datasetVariables) {
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
