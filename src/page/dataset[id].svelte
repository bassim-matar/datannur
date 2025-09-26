<script lang="ts">
  import db from '@db'
  import { removeDuplicateById, getLineage } from '@lib/db'
  import { tabsHelper } from '@tab/tabs-helper'
  import Tabs from '@tab/Tabs.svelte'
  import Title from '@layout/Title.svelte'

  let { id } = $props()
  const dataset = db.get('dataset', id)

  let datasetVariables = db.getAll('variable', { dataset })
  dataset.nb_variable = datasetVariables.length

  let modalities = []
  for (const variable of datasetVariables) {
    modalities = modalities.concat(variable.modalities)
  }
  modalities = removeDuplicateById(modalities)

  let datasetPreview = dataset.link ? dataset.id : false

  const modalitiesId = new Set(modalities.map(item => item.id))

  const datasets = [
    ...getLineage('dataset', dataset, 'source'),
    ...getLineage('dataset', dataset, 'derived'),
  ]

  const evolutions = db
    .getAll('evolution')
    .filter(
      evo =>
        (evo.entity === 'dataset' && evo.id === dataset.id) ||
        (evo.parent_entity === 'dataset' &&
          evo.parent_entity_id === dataset.id) ||
        (evo.parent_entity === 'modality' &&
          modalitiesId.has(evo.parent_entity_id)) ||
        (evo.entity === 'modality' && modalitiesId.has(evo.id)),
    )

  const stat = [
    { entity: 'doc', items: dataset.docs },
    { entity: 'variable', items: datasetVariables },
    { entity: 'modality', items: modalities },
  ]

  let tabs = tabsHelper({
    dataset,
    docs: dataset.docs,
    datasets,
    datasetVariables,
    modalities,
    datasetPreview,
    evolutions,
    stat,
  })
</script>

<section class="section">
  <Title type="dataset" name={dataset.name} id={dataset.id} />
  <Tabs {tabs} />
</section>
