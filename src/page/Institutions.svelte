<script lang="ts">
  import db from '@db'
  import { tabSelected } from '@lib/store'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import { is_big_limit } from '@lib/constant'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'
  import EvolutionSummarySwitch from '@layout/EvolutionSummarySwitch.svelte'
  import about_file from '@markdown/about-institution.md?raw'

  let key_tab = $state(1)

  const institutions = db.getAll('institution')
  makeParentsRelative(0, institutions)
  addMinimumDeep(institutions)

  const tags = db.getAll('tag').filter(tag => tag.nb_institution > 0)
  if (db.use.tag_recursive) {
    makeParentsRelative(false, tags)
    addMinimumDeep(tags, true, true)
  }

  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'institution')

  const tabs = tabsHelper({
    institutions,
    tags,
    evolutions,
    stat: [{ entity: 'institution', items: institutions }],
    about_file,
  })

  const nb_institution = institutions.length

  let show_open_all_switch = $derived(
    $tabSelected.key === 'institutions' && nb_institution > is_big_limit,
  )
  let show_evolution_summary_switch = $derived(
    $tabSelected.key === 'evolutions' && evolutions.length > is_big_limit,
  )
</script>

<section class="section">
  <Title type="institution" name="Institutions" mode="main_title" />
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
