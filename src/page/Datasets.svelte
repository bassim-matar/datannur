<script lang="ts">
  import db from '@db'
  import { make_parents_relative, add_minimum_deep } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import about_file from '@markdown/about-dataset.md?raw'

  const datasets = db.getAll('dataset')
  const tags = db.getAll('tag').filter(tag => tag.nb_dataset > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'dataset')

  const tabs = tabsHelper({
    datasets,
    tags,
    evolutions,
    stat: [{ entity: 'dataset', items: datasets }],
    about_file,
  })
</script>

<section class="section">
  <Title type="dataset" name="Datasets" mode="main_title" />
  <Tabs {tabs} />
</section>
