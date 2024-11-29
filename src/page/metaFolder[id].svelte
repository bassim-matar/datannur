<script>
  import db from "@db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  let { metaFolder } = $props()

  let metaDatasets = db.get_all("metaDataset", { metaFolder })

  const metaVariables = metaDatasets.flatMap(metaDataset =>
    db.get_all("metaVariable", { metaDataset }),
  )

  const tabs = tabs_helper({ folder: metaFolder, metaDatasets, metaVariables })
</script>

<section class="section">
  <Title type="folder" name={metaFolder.name} />
  <Tabs {tabs} />
</section>
