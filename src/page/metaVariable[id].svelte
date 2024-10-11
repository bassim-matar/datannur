<script>
  import db from "@db"
  import { filter_keys } from "@js/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"

  export let metaVariable
  metaVariable.is_meta = true

  let variable_preview = []
  let dataset_preview = []
  let metaDataset = db.get("metaDataset", metaVariable.metaDataset_id)
  if (metaDataset.name in db.tables) {
    dataset_preview = db.tables[metaDataset.name]
  } else if (metaDataset.name in db.tables.__user_data__) {
    dataset_preview = db.tables.__user_data__[metaDataset.name]
  }
  variable_preview = filter_keys(dataset_preview, [metaVariable.name])

  let tabs = tabs_helper({
    variable_info: metaVariable,
    variable_metaValues: metaVariable.values,
    variable_preview,
  })
</script>

<section class="section">
  <Title type="variable" name={metaVariable.name} />
  <Tabs {tabs} />
</section>
