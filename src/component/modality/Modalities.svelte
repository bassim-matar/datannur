<script lang="ts">
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { modalities } = $props()

  let nbValueMax = 0
  let nbVariableMax = 0
  for (const modality of modalities) {
    nbValueMax = Math.max(nbValueMax, modality.nbValue)
    nbVariableMax = Math.max(nbVariableMax, modality.nbVariable)
  }

  const columns = [
    Column.favorite(),
    Column.name('modality', 'Modalité'),
    Column.description(),
    Column.datatype(),
    Column.nbVariable('modality', nbVariableMax, { showTitle: true }),
    Column.nbValues(nbValueMax),
    Column.valuesPreview(),
    Column.folder(),
  ]
</script>

<Datatable entity="modality" data={modalities} {columns} sortByName={true} />
