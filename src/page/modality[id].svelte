<script>
  import db from "@db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  let { modality } = $props()

  const variables = db.get_all("variable", { modality })
  const values = modality.values

  const history = db
    .get_all("history")
    .filter(
      history =>
        (history.entity === "modality" && history.id === modality.id) ||
        (history.parent_entity === "modality" &&
          history.parent_entity_id === modality.id),
    )

  const tabs = tabs_helper({ modality, values, variables, history })
</script>

<section class="section">
  <Title type="modality" name={modality.name} id={modality.id} />
  <Tabs {tabs} />
</section>
