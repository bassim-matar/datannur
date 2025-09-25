<script lang="ts">
  import db from '@db'
  import { filterKeys } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import type { Row } from '@type'

  let { metaVariable } = $props()

  let variable_preview = []
  let dataset_preview: Row[] = []
  let metaDataset = db.get('metaDataset', metaVariable.metaDataset_id)
  if (metaDataset.name in db.tables) {
    dataset_preview = db.tables[metaDataset.name] as Row[]
  } else if (metaDataset.name in db.tables.__user_data__) {
    dataset_preview = db.tables.__user_data__[metaDataset.name] as Row[]
  }
  variable_preview = filterKeys(dataset_preview, [metaVariable.name])

  let tabs = tabsHelper({
    variable: metaVariable,
    variable_metaValues: metaVariable.values,
    variable_preview,
  })
</script>

<section class="section">
  <Title type="variable" name={metaVariable.name} />
  <Tabs {tabs} />
</section>
