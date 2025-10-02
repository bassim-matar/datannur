<script lang="ts">
  import Logs from '@lib/logs'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import aboutFile from '@markdown/about-options.md?raw'

  let logs = Logs.getAll()
  let tabs = tabsHelper({
    options: '',
    logs,
    stat: [{ entity: 'log', items: logs }],
    aboutFile,
  })
</script>

<section class="section">
  <Title type="option" name="Options" mode="mainTitle" />
  <Tabs {tabs} />
</section>
