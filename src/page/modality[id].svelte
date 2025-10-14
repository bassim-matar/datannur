<script lang="ts">
  import db from '@db'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'
  import type { Modality } from '@type'

  let { modality }: { modality: Modality } = $props()

  const variables = db.getAll('variable', { modality })
  const values = modality.values

  const evolutions = db
    .getAll('evolution')
    .filter(
      evo =>
        (evo.entity === 'modality' && evo.id === modality.id) ||
        (evo.parentEntity === 'modality' && evo.parentEntityId === modality.id),
    )

  const tabs = tabsHelper({ modality, values, variables, evolutions })
</script>

<section class="section">
  <Title type="modality" name={modality.name} id={modality.id} />
  <Tabs {tabs} />
</section>
