<script lang="ts">
  import aboutOrganisation from '@markdown/about-page/organisation.md?raw'
  import aboutFunctionality from '@markdown/about-page/functionality.md?raw'
  import { getAboutMain } from '@lib/get-about-main'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'

  const tabs = tabsHelper({
    aboutFile: getAboutMain(),
    aboutOrganisation,
    aboutFunctionality,
  })
</script>

<section class="section">
  <Title type="about" name="A propos" mode="main_title" />
  <Tabs {tabs} />
</section>
