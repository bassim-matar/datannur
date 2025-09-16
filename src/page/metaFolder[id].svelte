<script lang="ts">
  import db from '@db'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs_helper'
  import Title from '@layout/Title.svelte'

  let { metaFolder } = $props()

  let metaDatasets = db.getAll('metaDataset', { metaFolder })

  const metaVariables = metaDatasets.flatMap(metaDataset =>
    db.getAll('metaVariable', { metaDataset }),
  )

  const tabs = tabsHelper({ folder: metaFolder, metaDatasets, metaVariables })
</script>

<section class="section">
  <Title type="folder" name={metaFolder.name} />
  <Tabs {tabs} />
</section>
