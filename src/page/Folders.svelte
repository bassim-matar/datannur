<script lang="ts">
  import db from '@db'
  import { tab_selected } from '@lib/store'
  import { make_parents_relative, add_minimum_deep } from '@lib/db'
  import { is_big_limit } from '@lib/constant'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs_helper'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'
  import EvolutionSummarySwitch from '@layout/EvolutionSummarySwitch.svelte'
  import about_file from '@markdown/about_folder.md?raw'

  const folders = db.getAll('folder')
  make_parents_relative(0, folders)
  add_minimum_deep(folders)

  const tags = db.getAll('tag').filter(tag => tag.nb_folder > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'folder')

  const tabs = tabsHelper({
    folders,
    tags,
    evolutions,
    stat: [{ entity: 'folder', items: folders }],
    about_file,
  })

  const nb_folder = folders.length
  let key_tab = $state(1)
  let show_open_all_switch = $derived(
    $tab_selected.key === 'folders' && nb_folder > is_big_limit,
  )
  let show_evolution_summary_switch = $derived(
    $tab_selected.key === 'evolutions' && evolutions.length > is_big_limit,
  )
</script>

<section class="section">
  <Title type="folder" name="Dossiers" mode="main_title" />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#if show_evolution_summary_switch}
    <EvolutionSummarySwitch on_change={value => (key_tab = value)} />
  {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
