<script lang="ts">
  import Column from "@lib/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { dataset_variables, is_meta = false } = $props()

  const meta_path = is_meta ? "metaVariable" : false

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
      Column.name("variable", "Variable", { is_meta }),
      Column.original_name(),
      Column.description(),
      Column.datatype(),
      Column.is_key(),
      Column.nb_sources(nb_sources_max, "variable"),
      Column.nb_derived(nb_derived_max, "variable"),
      Column.nb_missing(),
      Column.nb_duplicates(),
      Column.freq(),
      Column.nb_values(nb_value_max),
      Column.values_preview(),
    ]
    if (is_meta) return [...base, Column.meta_localisation()]
    return [
      Column.favorite(),
      ...base,
      Column.modality(),
      Column.tag(),
      Column.start_date(),
      Column.end_date(),
    ]
  }

  const columns = define_columns()
</script>

<Datatable entity="variable" data={dataset_variables} {columns} {meta_path} />
