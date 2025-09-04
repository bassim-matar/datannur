<script lang="ts">
  import Column from "@lib/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { modalities } = $props()

  let nb_value_max = 0
  let nb_variable_max = 0
  for (const modality of modalities) {
    nb_value_max = Math.max(nb_value_max, modality.nb_value)
    nb_variable_max = Math.max(nb_variable_max, modality.nb_variable)
  }

  const columns = [
    Column.favorite(),
    Column.name("modality", "Modalité"),
    Column.description(),
    Column.datatype(),
    Column.nb_variable("modality", nb_variable_max, { show_title: true }),
    Column.nb_values(nb_value_max),
    Column.values_preview(),
    Column.folder(),
  ]
</script>

<Datatable entity="modality" data={modalities} {columns} sort_by_name={true} />
