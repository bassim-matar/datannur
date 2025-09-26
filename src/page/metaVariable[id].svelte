<script lang="ts">
  import db from '@db'
  import { filterKeys } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import type { Row } from '@type'

  let { metaVariable } = $props()

  let variablePreview = []
  let datasetPreview: Row[] = []
  let metaDataset = db.get('metaDataset', metaVariable.metaDataset_id)
  if (metaDataset.name in db.tables) {
    datasetPreview = db.tables[metaDataset.name] as Row[]
  } else if (metaDataset.name in db.tables.__user_data__) {
    datasetPreview = db.tables.__user_data__[metaDataset.name] as Row[]
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
