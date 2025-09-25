<script lang="ts">
  import db from '@db'
  import { tabsHelper } from '@tab/tabs-helper'
  import { getLineage } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'

  let { variable } = $props()

  const dataset = db.get('dataset', variable.dataset_id)
  let variable_preview: false | object = false
  if (dataset.link) {
    variable_preview = {
      variable: variable.name,
      dataset_id: dataset.link ? dataset.id : false,
    }
  }

  const variables = [
    ...getLineage('variable', variable, 'source'),
    ...getLineage('variable', variable, 'derived'),
  ]

  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'variable' && evo.id === variable.id)

  const freq_data = db.getAll('freq', { variable })

  let tabs = tabsHelper({
    variable,
    variables,
    variable_values: variable.values,
    freq: freq_data,
    variable_preview,
    evolutions,
  })
</script>

<section class="section">
  <Title type="variable" name={variable.name} id={variable.id} />
  <Tabs {tabs} />
</section>
