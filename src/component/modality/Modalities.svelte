<script>
  import { link, get_percent } from "@js/util"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import Datatable from "@datatable/Datatable.svelte"

  export let modalities
  export let nb_item = false
  export let load_first = false

  let nb_value_max = 0
  let nb_variable_max = 0
  for (const modality of modalities) {
    if (modality.values.length > nb_value_max) {
      nb_value_max = modality.values.length
    }
    if (modality.nb_variable > nb_variable_max) {
      nb_variable_max = modality.nb_variable
    }
  }

  const columns = [
    Column.favorite(),
    Column.name("modality", "Modalité"),
    Column.description(),
    Column.datatype(),
    Column.nb_variable("modality", nb_variable_max, { show_title: true }),
    {
      data: "values",
      title: Render.icon("value") + "Nb",
      defaultContent: "",
      tooltip: "Nombre de valeurs",
      render: (data, _, row) => {
        if (!data.length) return ""
        const percent = get_percent(data.length / nb_value_max)
        const content = link(
          `modality/${row.id}?tab=values`,
          Render.num(data.length),
        )
        return `${Render.num_percent(content, percent, "value")}`
      },
    },
    Column.values_preview(),
    Column.folder(),
  ]
</script>

{#if modalities.length > 0}
  <Datatable
    entity="modality"
    data={modalities}
    {columns}
    {load_first}
    bind:nb_item
  />
{/if}
