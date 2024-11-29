<script>
  import db from "@db"
  import { filter_keys } from "@js/db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  let { metaDataset } = $props()

  let meta_dataset_variables = db.get_all("metaVariable", { metaDataset })

  let dataset_preview = []
  if (metaDataset.name in db.tables) {
    const dataset_preview_raw = db.tables[metaDataset.name]
    const keys_to_keep = meta_dataset_variables.map(a => a.name)
    dataset_preview = filter_keys(dataset_preview_raw, keys_to_keep)
  } else if (metaDataset.name in db.tables.__user_data__) {
    dataset_preview = db.tables.__user_data__[metaDataset.name]
  }

  let tabs = tabs_helper({
    dataset: metaDataset,
    meta_dataset_variables,
    dataset_preview,
  })
</script>

<section class="section">
  <Title type="dataset" name={metaDataset.name} />
  <Tabs {tabs} />
</section>
