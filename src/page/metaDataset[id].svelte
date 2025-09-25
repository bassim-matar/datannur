<script lang="ts">
  import db from '@db'
  import { filterKeys } from '@lib/db'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'

  let { metaDataset } = $props()

  let meta_dataset_variables = db.getAll('metaVariable', { metaDataset })

  let dataset_preview = []
  if (metaDataset.name in db.tables) {
    const dataset_preview_raw = db.tables[metaDataset.name]
    const keysToKeep = meta_dataset_variables.map(a => a.name)
    dataset_preview = filterKeys(dataset_preview_raw, keysToKeep)
  } else if (metaDataset.name in db.tables.__user_data__) {
    dataset_preview = db.tables.__user_data__[metaDataset.name]
  }

  let tabs = tabsHelper({
    dataset: metaDataset,
    meta_dataset_variables,
    dataset_preview,
  })
</script>

<section class="section">
  <Title type="dataset" name={metaDataset.name} />
  <Tabs {tabs} />
</section>
