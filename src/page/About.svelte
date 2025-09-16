<script lang="ts">
  import about_organisation from '@markdown/about_page/organisation.md?raw'
  import about_functionality from '@markdown/about_page/functionality.md?raw'
  import { get_about_main } from '@lib/get_about_main'
  import { tabsHelper } from '@tab/tabs_helper'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'

  const tabs = tabsHelper({
    about_file: get_about_main(),
    about_organisation,
    about_functionality,
  })
</script>

<section class="section">
  <Title type="about" name="A propos" mode="main_title" />
  <Tabs {tabs} />
</section>
