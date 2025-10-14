<script lang="ts">
  import db from '@db'
  import { tabSelected } from '@lib/store'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import { isBigLimit } from '@lib/constant'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'
  import EvolutionSummarySwitch from '@layout/EvolutionSummarySwitch.svelte'
  import aboutFile from '@markdown/about-institution.md?raw'

  let keyTab = $state(1)

  const institutions = db.getAll('institution')
  makeParentsRelative(false, institutions)
  addMinimumDeep(institutions)

  const tags = db.getAll('tag').filter(tag => !!tag.nbInstitution)
  if (db.useRecursive.tag) {
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
    aboutFile,
  })

  const nbInstitution = institutions.length

  let showOpenAllSwitch = $derived(
    $tabSelected.key === 'institutions' && nbInstitution > isBigLimit,
  )
  let showEvolutionSummarySwitch = $derived(
    $tabSelected.key === 'evolutions' && evolutions.length > isBigLimit,
  )
</script>

<section class="section">
  <Title type="institution" name="Institutions" mode="mainTitle" />
  {#if showOpenAllSwitch}
    <OpenAllSwitch onChange={() => keyTab++} />
  {/if}
  {#if showEvolutionSummarySwitch}
    <EvolutionSummarySwitch onChange={() => keyTab++} />
  {/if}
  {#key keyTab}
    <Tabs {tabs} />
  {/key}
</section>
