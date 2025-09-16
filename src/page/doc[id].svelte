<script lang="ts">
  import db from '@db'
  import { make_parents_relative, add_minimum_deep } from '@lib/db'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs_helper'
  import Title from '@layout/Title.svelte'

  let { doc } = $props()

  const institutions = db.getAll('institution', { doc })
  const folders = db.getAll('folder', { doc })
  const tags = db.getAll('tag', { doc })
  const datasets = db.getAll('dataset', { doc })

  make_parents_relative(false, institutions)
  make_parents_relative(false, folders)
  make_parents_relative(false, tags)

  add_minimum_deep(institutions)
  add_minimum_deep(folders)
  add_minimum_deep(tags)

  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'doc' && evo.id === doc.id)

  let tabs = tabsHelper({
    doc,
    institutions,
    folders,
    tags,
    datasets,
    evolutions,
  })
</script>

<section class="section">
  <Title type="doc" name={doc.name} id={doc.id} />
  <Tabs {tabs} />
</section>
