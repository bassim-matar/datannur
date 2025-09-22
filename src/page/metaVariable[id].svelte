<script lang="ts">
  import db from '@db'
  import { filter_keys } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'

  let { metaVariable } = $props()

  let variable_preview = []
  let dataset_preview = []
  let metaDataset = db.get('metaDataset', metaVariable.metaDataset_id)
  if (metaDataset.name in db.tables) {
    dataset_preview = db.tables[metaDataset.name]
  } else if (metaDataset.name in db.tables.__user_data__) {
    dataset_preview = db.tables.__user_data__[metaDataset.name]
  }
  variable_preview = filter_keys(dataset_preview, [metaVariable.name])

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
