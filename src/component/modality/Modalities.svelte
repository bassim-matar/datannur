<script lang="ts">
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { modalities } = $props()

  let nb_value_max = 0
  let nb_variable_max = 0
  for (const modality of modalities) {
    nb_value_max = Math.max(nb_value_max, modality.nb_value)
    nb_variable_max = Math.max(nb_variable_max, modality.nb_variable)
  }

  const columns = [
    Column.favorite(),
    Column.name('modality', 'Modalité'),
    Column.description(),
    Column.datatype(),
    Column.nbVariable('modality', nb_variable_max, { show_title: true }),
    Column.nbValues(nb_value_max),
    Column.valuesPreview(),
    Column.folder(),
  ]
</script>

<Datatable entity="modality" data={modalities} {columns} sort_by_name={true} />
