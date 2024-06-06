<script>
  import db from "@db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  export let metaFolder

  metaFolder.is_meta = true
  let metaDatasets = db.get_all("metaDataset", { metaFolder })

  let metaVariables = []
  for (const metaDataset of metaDatasets) {
    metaVariables = metaVariables.concat(
      db.get_all("metaVariable", { metaDataset })
    )
  }

  let tabs = tabs_helper({
    folder_info: metaFolder,
    metaDatasets,
    metaVariables,
  })
</script>

<section class="section">
  <Title type="folder" name={metaFolder.name} />
  <Tabs {tabs} />
</section>
