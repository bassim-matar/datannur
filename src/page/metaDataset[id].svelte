<script lang="ts">
  import db from '@db'
  import { filterKeys } from '@lib/db'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'

  let { metaDataset } = $props()

  let metaDatasetVariables = db.getAll('metaVariable', { metaDataset })

  let datasetPreview = []
  if (metaDataset.name in db.tables) {
    const datasetPreviewRaw = db.tables[metaDataset.name]
    const keysToKeep = metaDatasetVariables.map(a => a.name)
    datasetPreview = filterKeys(datasetPreviewRaw, keysToKeep)
  } else if (metaDataset.name in db.tables.__user_data__) {
    datasetPreview = db.tables.__user_data__[metaDataset.name]
  }

  let tabs = tabsHelper({
    dataset: metaDataset,
    metaDatasetVariables,
    datasetPreview,
  })
</script>

<section class="section">
  <Title type="dataset" name={metaDataset.name} />
  <Tabs {tabs} />
</section>
