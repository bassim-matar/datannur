<script lang="ts">
  import db from '@db'
  import { make_parents_relative, add_minimum_deep } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import about_file from '@markdown/about-variable.md?raw'

  const variables = db.getAll('variable')
  const tags = db.getAll('tag').filter(tag => tag.nb_variable > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'variable')

  const tabs = tabsHelper({
    variables,
    tags,
    evolutions,
    stat: [{ entity: 'variable', items: variables }],
    about_file,
  })
</script>

<section class="section">
  <Title type="variable" name="Variables" mode="main_title" />
  <Tabs {tabs} />
</section>
