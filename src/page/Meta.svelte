<script>
  import db from "@db"

  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_main_meta.md?raw"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"

  const metaFolders = db.get_all("metaFolder")
  const metaDatasets = db.get_all("metaDataset")
  const metaVariables = db.get_all("metaVariable")

  const stat = [
    { entity: "folder", items: metaFolders },
    { entity: "dataset", items: metaDatasets },
    { entity: "variable", items: metaVariables },
  ]

  const tabs = tabs_helper({
    about_file,
    metaFolders,
    metaDatasets,
    metaVariables,
    metaDiagramm: "",
    stat,
  })
</script>

<section class="section">
  <Title type="internal_view" name="Vue interne" mode="main_title" />
  <Tabs {tabs} />
</section>
