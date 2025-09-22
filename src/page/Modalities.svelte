<script lang="ts">
  import db from '@db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import about_file from '@markdown/about-modality.md?raw'

  const modalities = db.getAll('modality')
  const raw_tabs: any = { modalities }
  if (modalities.length > 1) raw_tabs.modalities_compare = false

  raw_tabs.evolutions = db
    .getAll('evolution')
    .filter(evo => evo.entity === 'modality' || evo.entity === 'value')

  raw_tabs.stat = [{ entity: 'modality', items: modalities }]
  raw_tabs.about_file = about_file

  const tabs = tabsHelper(raw_tabs)
</script>

<section class="section">
  <Title type="modality" name="Modalités" mode="main_title" />
  <Tabs {tabs} />
</section>
