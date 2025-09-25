<script lang="ts">
  import db from '@db'
  import { tabSelected } from '@lib/store'
  import {
    makeParentsRelative,
    getRecursive,
    removeDuplicateById,
    addMinimumDeep,
  } from '@lib/db'
  import { is_big_limit } from '@lib/constant'
  import { tabsHelper } from '@tab/tabs-helper'
  import Tags from '@lib/tags'
  import Tabs from '@tab/Tabs.svelte'

  import Title from '@layout/Title.svelte'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'
  import EvolutionSummarySwitch from '@layout/EvolutionSummarySwitch.svelte'

  let { folder } = $props()

  const docs = folder.docs_recursive

  const folders = db.getAllChilds('folder', folder.id)
  makeParentsRelative(folder.id, folders)
  addMinimumDeep(folders)

  const datasets = getRecursive('folder', folder.id, 'dataset')
  const variables = datasets.flatMap(dataset =>
    db.getAll('variable', { dataset }),
  )

  let modalities = variables.flatMap(variable => variable.modalities)
  let direct_modalities = db.getAll('modality', { folder })
  modalities = modalities.concat(direct_modalities)
  modalities = removeDuplicateById(modalities)

  const tags = Tags.getFromEntities({ folders, datasets })
  makeParentsRelative(false, tags)
  addMinimumDeep(tags)

  const modalities_id = new Set(modalities.map(item => item.id))
  const variables_id = new Set(variables.map(item => item.id))
  const datasets_id = new Set(datasets.map(item => item.id))
  const folders_id = new Set(folders.map(item => item.id))

  const evolutions = db
    .getAll('evolution')
    .filter(
      evo =>
        (evo.parent_entity === 'modality' &&
          modalities_id.has(evo.parent_entity_id)) ||
        (evo.entity === 'modality' && modalities_id.has(evo.id)) ||
        (evo.entity === 'variable' && variables_id.has(evo.id)) ||
        (evo.entity === 'dataset' && datasets_id.has(evo.id)) ||
        (evo.entity === 'folder' &&
          (evo.id === folder.id || folders_id.has(evo.id))),
    )

  const stat = [
    { entity: 'folder', items: folders },
    { entity: 'tag', items: tags },
    { entity: 'doc', items: docs },
    { entity: 'dataset', items: datasets },
    { entity: 'variable', items: variables },
    { entity: 'modality', items: modalities },
  ]

  const tabs = tabsHelper({
    folder,
    folders,
    tags,
    docs,
    datasets,
    variables,
    modalities,
    evolutions,
    stat,
  })

  const nb_folder = folders.length
  let key_tab = $state(1)
  let show_open_all_switch = $derived(
    $tabSelected.key === 'folders' && nb_folder > is_big_limit,
  )
  let show_evolution_summary_switch = $derived(
    $tabSelected.key === 'evolutions' && evolutions.length > is_big_limit,
  )
</script>

<section class="section">
  <Title type="folder" name={folder.name} id={folder.id} />
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
