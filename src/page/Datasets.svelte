<script lang="ts">
  import db from '@db'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import aboutFile from '@markdown/about-dataset.md?raw'

  const datasets = db.getAll('dataset')
  const tags = db.getAll('tag').filter(tag => tag.nbDataset > 0)
  if (db.useRecursive.tag) {
    makeParentsRelative(false, tags)
    addMinimumDeep(tags, true, true)
  }

  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'dataset')

  const tabs = tabsHelper({
    datasets,
    tags,
    evolutions,
    stat: [{ entity: 'dataset', items: datasets }],
    aboutFile,
  })
</script>

<section class="section">
  <Title type="dataset" name="Datasets" mode="mainTitle" />
  <Tabs {tabs} />
</section>
