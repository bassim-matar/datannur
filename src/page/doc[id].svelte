<script lang="ts">
  import db from '@db'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'
  import type { Doc } from '@type'

  let { doc }: { doc: Doc } = $props()

  const institutions = db.getAll('institution', { doc })
  const folders = db.getAll('folder', { doc })
  const tags = db.getAll('tag', { doc })
  const datasets = db.getAll('dataset', { doc })

  makeParentsRelative(false, institutions)
  makeParentsRelative(false, folders)
  makeParentsRelative(false, tags)

  addMinimumDeep(institutions)
  addMinimumDeep(folders)
  addMinimumDeep(tags)

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
