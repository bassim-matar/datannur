<script>
  import db from "@db"
  import { tabs_helper } from "@tab/tabs_helper"
  import { get_lineage } from "@js/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"

  let { variable } = $props()

  const dataset = db.get("dataset", variable.dataset_id)
  let variable_preview = false
  if (dataset.link) {
    variable_preview = {
      variable: variable.name,
      dataset_id: dataset.link ? dataset.id : false,
    }
  }

  const variables = [
    ...get_lineage("variable", variable, "source"),
    ...get_lineage("variable", variable, "derived"),
  ]

  const evolutions = db
    .get_all("evolution")
    .filter(evo => evo.entity === "variable" && evo.id === variable.id)

  // Récupérer les données de fréquence pour cette variable
  const freq_data = db.get_all("freq").filter(item => item.variable_id === variable.id)

  let tabs = tabs_helper({
    variable,
    variables,
    variable_values: variable.values,
    freq: freq_data,
    variable_preview,
    evolutions,
  })
</script>

<section class="section">
  <Title type="variable" name={variable.name} id={variable.id} />
  <Tabs {tabs} />
</section>
