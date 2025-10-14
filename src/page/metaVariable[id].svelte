<script lang="ts">
  import db from '@db'
  import { filterKeys } from '@lib/db'
  import { getUserData } from '@lib/user-data'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import type { MetaVariable } from '@type'

  let { metaVariable }: { metaVariable: MetaVariable } = $props()

  let variablePreview: Record<string, unknown>[] = []
  let datasetPreview: Record<string, unknown>[] = []
  let metaDataset = db.get('metaDataset', metaVariable.metaDatasetId)
  if (metaDataset?.metaFolderId === 'data') {
    datasetPreview = db.tables[metaDataset.name]
  } else if (metaDataset?.metaFolderId === 'userData') {
    const userData = getUserData()
    datasetPreview = userData?.[metaDataset.name] ?? []
  }
  variablePreview = filterKeys(datasetPreview, [metaVariable.name])

  let tabs = tabsHelper({
    metaVariable,
    variableMetaValues: metaVariable.values,
    variablePreview,
  })
</script>

<section class="section">
  <Title
    type="variable"
    name={metaVariable.storageKey ? metaVariable.storageKey : metaVariable.name}
  />
  <Tabs {tabs} />
</section>
