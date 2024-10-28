<script>
  import db from "@db"
  import Head from "@frame/Head.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_main_meta.md?raw"

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

<Head title="Vue Meta" description="Page d'accueil de la vue Meta" />

<section class="section">
  <Tabs {tabs} />
</section>

<style lang="scss">
  .section {
    margin-top: 80px;
  }
</style>
