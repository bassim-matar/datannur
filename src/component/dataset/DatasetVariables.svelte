<script lang="ts">
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { dataset_variables, is_meta = false } = $props()

  const meta_path = is_meta ? 'metaVariable' : false

  let nb_value_max = 0
  let nb_sources_max = 0
  let nb_derived_max = 0
  for (const variable of dataset_variables) {
    nb_value_max = Math.max(nb_value_max, variable.nb_value)
    nb_sources_max = Math.max(nb_sources_max, variable.source_ids?.length || 0)
    nb_derived_max = Math.max(nb_derived_max, variable.derived_ids?.length || 0)
  }

  function define_columns() {
    const base = [
      Column.name('variable', 'Variable', { is_meta }),
      Column.originalName(),
      Column.description(),
      Column.datatype(),
      Column.isKey(),
      Column.nbSources(nb_sources_max, 'variable'),
      Column.nbDerived(nb_derived_max, 'variable'),
      Column.nbMissing(),
      Column.nbDuplicates(),
      Column.freq(),
      Column.nbValues(nb_value_max),
      Column.valuesPreview(),
    ]
    if (is_meta) return [...base, Column.metaLocalisation()]
    return [
      Column.favorite(),
      ...base,
      Column.modality(),
      Column.tag(),
      Column.startDate(),
      Column.endDate(),
    ]
  }

  const columns = define_columns()
</script>

<Datatable entity="variable" data={dataset_variables} {columns} {meta_path} />
