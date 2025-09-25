<script lang="ts">
  import db from '@db'
  import { tabSelected } from '@lib/store'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import { is_big_limit } from '@lib/constant'
  import { tabsHelper } from '@tab/tabs-helper'
  import { getAboutMain } from '@lib/get-about-main'
  import Head from '@frame/Head.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'
  import EvolutionSummarySwitch from '@layout/EvolutionSummarySwitch.svelte'

  let key_tab = $state(1)

  let institutions = db.getAll('institution')
  let folders = db.getAll('folder')
  let tags = db.getAll('tag')
  const datasets = db.getAll('dataset')
  const variables = db.getAll('variable')
  const modalities = db.getAll('modality')
  const docs = db.getAll('doc')
  const evolutions = db.getAll('evolution')

  makeParentsRelative(0, institutions)
  makeParentsRelative(0, folders)
  addMinimumDeep(institutions)
  addMinimumDeep(folders)

  if (db.use.tag_recursive) {
    makeParentsRelative(0, tags)
    addMinimumDeep(tags)
  }

  const stat = [
    { entity: 'institution', items: institutions },
    { entity: 'folder', items: folders },
    { entity: 'tag', items: tags },
    { entity: 'doc', items: docs },
    { entity: 'dataset', items: datasets },
    { entity: 'variable', items: variables },
    { entity: 'modality', items: modalities },
  ]

  let tabs = tabsHelper({
    about_file: getAboutMain(),
    institutions,
    folders,
    tags,
    docs,
    datasets,
    variables,
    modalities,
    evolutions,
    stat,
  })

  const all_empty =
    !db.use.institution &&
    !db.use.folder &&
    !db.use.tag &&
    !db.use.doc &&
    !db.use.dataset &&
    !db.use.variable &&
    !db.use.modality &&
    !db.use.about

  const nb_institution = institutions.length
  const nb_folder = folders.length
  const nb_tag = tags.length

  let show_open_all_switch = $derived(
    ($tabSelected.key === 'institutions' && nb_institution > is_big_limit) ||
      ($tabSelected.key === 'folders' && nb_folder > is_big_limit) ||
      ($tabSelected.key === 'tags' && nb_tag > is_big_limit),
  )

  let show_evolution_summary_switch = $derived(
    $tabSelected.key === 'evolutions' && evolutions.length > is_big_limit,
  )
</script>

<Head title="datannur | Accueil" description="Page d'accueil de datannur" />

<section class="section">
  {#if all_empty}
    <p class="has-text-centered">Le catalogue est vide.</p>
    <p class="has-text-centered">Vous pouvez ajouter du contenu.</p>
  {:else}
    {#if show_open_all_switch}
      <OpenAllSwitch onChange={value => (key_tab = value)} />
    {/if}
    {#if show_evolution_summary_switch}
      <EvolutionSummarySwitch onChange={value => (key_tab = value)} />
    {/if}
    {#key key_tab}
      <Tabs {tabs} />
    {/key}
  {/if}
</section>

<style lang="scss">
  .section {
    margin-top: 80px;
  }
</style>
