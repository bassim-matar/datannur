<script lang="ts">
  import db from '@db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import aboutFile from '@markdown/about-modality.md?raw'

  const modalities = db.getAll('modality')
  const evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'modality' || evo.entity === 'value')

  const tabs = tabsHelper({
    modalities,
    modalitiesCompare: modalities.length > 1,
    evolutions,
    stat: [{ entity: 'modality', items: modalities }],
    aboutFile,
  })
</script>

<section class="section">
  <Title type="modality" name="Modalités" mode="main_title" />
  <Tabs {tabs} />
</section>
