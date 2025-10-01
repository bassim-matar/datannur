<script lang="ts">
  import db from '@db'
  import { filterKeys } from '@lib/db'
  import { getUserData } from '@lib/user-data'
  import { tabsHelper } from '@tab/tabs-helper'
  import Tabs from '@tab/Tabs.svelte'
  import Title from '@layout/Title.svelte'

  let { metaDataset } = $props()

  let metaDatasetVariables = db.getAll('metaVariable', { metaDataset })

  let datasetPreview = []
  if (metaDataset.metaFolder_id === 'data') {
    const datasetPreviewRaw = db.getAll(metaDataset.name)
    const keysToKeep = metaDatasetVariables.map(a => a.name)
    datasetPreview = filterKeys(datasetPreviewRaw, keysToKeep)
  } else if (metaDataset.metaFolder_id === 'user_data') {
    const userData = getUserData()
    datasetPreview = userData?.[metaDataset.name]
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
