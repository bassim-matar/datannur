<script>
  import db from "@db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
 
  let { variable } = $props()

  const dataset = db.get("dataset", variable.dataset_id)
  let variable_preview = false
  if (dataset.link) {
    variable_preview = {
      variable: variable.name,
      dataset_id: dataset.link ? dataset.id : false,
    }
  }

  function get_variable_lineage(variable, type) {
    const lineage = []
    const lineage_ids = variable[`${type}_ids`]
    if (!lineage_ids) return lineage
    for (const id of lineage_ids) {
      const item = db.get("variable", id)
      if (!item) continue
      lineage.push({ ...item, lineage_type: type })
    }
    return lineage
  }

  const variables = [
    ...get_variable_lineage(variable, "source"),
    ...get_variable_lineage(variable, "derived"),
  ]

  const evolutions = db
    .get_all("evolution")
    .filter(evo => evo.entity === "variable" && evo.id === variable.id)

  let tabs = tabs_helper({
    variable,
    variables,
    variable_values: variable.values,
    variable_preview,
    evolutions,
  })
</script>

<section class="section">
  <Title type="variable" name={variable.name} id={variable.id} />
  <Tabs {tabs} />
</section>
