<script lang="ts">
  import db from '@db'
  import { filterKeys } from '@lib/db'
  import { getUserData } from '@lib/user-data'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'

  let { metaVariable } = $props()

  let variablePreview = []
  let datasetPreview = []
  let metaDataset = db.get('metaDataset', metaVariable.metaDataset_id)
  if (metaDataset.metaFolder_id === 'data') {
    datasetPreview = db.tables[metaDataset.name]
  } else if (metaDataset.metaFolder_id === 'user_data') {
    const userData = getUserData()
    datasetPreview = userData?.[metaDataset.name]
  }
  variablePreview = filterKeys(datasetPreview, [metaVariable.name])

  let tabs = tabsHelper({
    variable: metaVariable,
    variableMetaValues: metaVariable.values,
    variablePreview,
  })
</script>

<section class="section">
  <Title type="variable" name={metaVariable.name} />
  <Tabs {tabs} />
</section>
