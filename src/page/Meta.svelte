<script lang="ts">
  import db from '@db'

  import { tabsHelper } from '@tab/tabs_helper'
  import about_file from '@markdown/about_main_meta.md?raw'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'

  const metaFolders = db.getAll('metaFolder')
  const metaDatasets = db.getAll('metaDataset')
  const metaVariables = db.getAll('metaVariable')

  const stat = [
    { entity: 'folder', items: metaFolders },
    { entity: 'dataset', items: metaDatasets },
    { entity: 'variable', items: metaVariables },
  ]

  const tabs = tabsHelper({
    about_file,
    metaFolders,
    metaDatasets,
    metaVariables,
    metaDiagramm: '',
    stat,
  })
</script>

<section class="section">
  <Title type="internal_view" name="Vue interne" mode="main_title" />
  <Tabs {tabs} />
</section>
