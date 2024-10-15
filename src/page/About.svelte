<script>
  import about_organisation from "@markdown/about_page/organisation.md?raw"
  import about_fonctionnality from "@markdown/about_page/fonctionnality.md?raw"
  import { get_about_main } from "@js/get_about_main"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"

  const tabs = tabs_helper({
    about_file: get_about_main(),
    about_organisation,
    about_fonctionnality,
  })
</script>

<section class="section">
  <Title type="about" name="A propos" mode="main_title" />
  <Tabs {tabs} />
</section>
