<script lang="ts">
  import db from '@db'
  import { tab_selected } from '@lib/store'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import { is_big_limit } from '@lib/constant'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'
  import EvolutionSummarySwitch from '@layout/EvolutionSummarySwitch.svelte'
  import about_file from '@markdown/about-tag.md?raw'

  let key_tab = $state(1)

  const tags = db.getAll('tag')
  if (db.use.tag_recursive) {
    makeParentsRelative(0, tags)
    addMinimumDeep(tags)
  }

  const evolutions = db.getAll('evolution').filter(evo => evo.entity === 'tag')

  const tabs = tabsHelper({
    tags,
    evolutions,
    stat: [{ entity: 'tag', items: tags }],
    about_file,
  })

  const nb_tags = tags.length
  let show_open_all_switch = $derived(
    $tab_selected.key === 'tags' && nb_tags > is_big_limit,
  )
  let show_evolution_summary_switch = $derived(
    $tab_selected.key === 'evolutions' && evolutions.length > is_big_limit,
  )
</script>

<section class="section">
  <Title type="tag" name="Mots clés" mode="main_title" />
  {#if show_open_all_switch}
    <OpenAllSwitch onChange={value => (key_tab = value)} />
  {/if}
  {#if show_evolution_summary_switch}
    <EvolutionSummarySwitch onChange={value => (key_tab = value)} />
  {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
