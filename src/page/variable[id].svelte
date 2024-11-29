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
  let tabs = tabs_helper({
    variable,
    variable_values: variable.values,
    variable_preview,
  })
</script>

<section class="section">
  <Title type="variable" name={variable.name} id={variable.id} />
  <Tabs {tabs} />
</section>
