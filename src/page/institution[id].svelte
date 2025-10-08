<script lang="ts">
  import db from '@db'
  import { tabSelected } from '@lib/store'
  import {
    makeParentsRelative,
    getRecursive,
    removeDuplicateById,
    addMinimumDeep,
  } from '@lib/db'
  import { isBigLimit } from '@lib/constant'
  import Tags from '@lib/tags'
  import { tabsHelper } from '@tab/tabs-helper'
  import Tabs from '@tab/Tabs.svelte'
  import Title from '@layout/Title.svelte'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'
  import EvolutionSummarySwitch from '@layout/EvolutionSummarySwitch.svelte'

  let { institution } = $props()

  let keyTab = $state(1)

  const docs = institution.docsRecursive

  const institutions = db.getAllChilds('institution', institution.id)
  makeParentsRelative(institution.id, institutions)
  addMinimumDeep(institutions)

  const folders = getRecursive('institution', institution.id, 'folder')
  makeParentsRelative(false, folders)
  addMinimumDeep(folders)

  const datasets = getRecursive('institution', institution.id, 'dataset')
  const variables = datasets.flatMap(dataset =>
    db.getAll('variable', { dataset }),
  )

  let modalities = variables.flatMap(variable => variable.modalities)
  modalities = removeDuplicateById(modalities)

  const tags = Tags.getFromEntities({ institutions, folders, datasets })
  makeParentsRelative(false, tags)
  addMinimumDeep(tags)

  const modalitiesId = new Set(modalities.map(item => item.id))
  const variablesId = new Set(variables.map(item => item.id))
  const datasetsId = new Set(datasets.map(item => item.id))
  const foldersId = new Set(folders.map(item => item.id))
  const institutionsId = new Set(institutions.map(item => item.id))

  const evolutions = db
    .getAll('evolution')
    .filter(
      evo =>
        (evo.entity === 'institution' &&
          (evo.id === institution.id || institutionsId.has(evo.id!))) ||
        (evo.entity === 'folder' && foldersId.has(evo.id)) ||
        (evo.entity === 'dataset' && datasetsId.has(evo.id)) ||
        (evo.entity === 'variable' && variablesId.has(evo.id)) ||
        (evo.entity === 'modality' && modalitiesId.has(evo.id)) ||
        (evo.parentEntity === 'modality' &&
          modalitiesId.has(evo.parentEntityId)),
    )

  const stat = [
    { entity: 'institution', items: institutions },
    { entity: 'folder', items: folders },
    { entity: 'tag', items: tags },
    { entity: 'doc', items: docs },
    { entity: 'dataset', items: datasets },
    { entity: 'variable', items: variables },
    { entity: 'modality', items: modalities },
  ]

  const tabs = tabsHelper({
    institution,
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

  const nbInstitution = institutions.length
  const nbFolder = folders.length
  let showOpenAllSwitch = $derived(
    ($tabSelected.key === 'institutions' && nbInstitution > isBigLimit) ||
      ($tabSelected.key === 'folders' && nbFolder > isBigLimit),
  )
  let showEvolutionSummarySwitch = $derived(
    $tabSelected.key === 'evolutions' && evolutions.length > isBigLimit,
  )
</script>

<section class="section">
  <Title type="institution" name={institution.name} id={institution.id} />
  {#if showOpenAllSwitch}
    <OpenAllSwitch onChange={value => (keyTab = value)} />
  {/if}
  {#if showEvolutionSummarySwitch}
    <EvolutionSummarySwitch onChange={value => (keyTab = value)} />
  {/if}
  {#key keyTab}
    <Tabs {tabs} />
  {/key}
</section>
