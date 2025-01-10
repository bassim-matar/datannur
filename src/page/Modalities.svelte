<script>
  import db from "@db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_modality.md?raw"

  const modalities = db.get_all("modality")
  const raw_tabs = { modalities }
  if (modalities.length > 1) raw_tabs.modalities_compare = false

  raw_tabs.history = db
    .get_all("history")
    .filter(
      history => history.entity === "modality" || history.entity === "value",
    )

  raw_tabs.stat = [{ entity: "modality", items: modalities }]
  raw_tabs.about_file = about_file

  const tabs = tabs_helper(raw_tabs)
</script>

<section class="section">
  <Title type="modality" name="Modalités" mode="main_title" />
  <Tabs {tabs} />
</section>
