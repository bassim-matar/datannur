<script>
  import db from "@db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  export let modality

  let variables = db.get_all("variable", { modality })
  let values = modality.values
  let tabs = tabs_helper({
    modality_info: modality,
    values,
    variables,
  })
</script>

<section class="section">
  <Title type="modality" name={modality.name} id={modality.id} />
  <Tabs {tabs} />
</section>
