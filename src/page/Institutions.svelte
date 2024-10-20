<script>
  import db from "@db"
  import { tab_selected } from "@js/store"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import { is_big_limit } from "@js/constant"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import OpenAllSwitch from "@layout/OpenAllSwitch.svelte"
  import about_file from "@markdown/about_institution.md?raw"

  const institutions = db.get_all("institution")
  make_parents_relative(0, institutions)
  add_minimum_deep(institutions)

  const tags = db.get_all("tag").filter(tag => tag.nb_institution > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const tabs = tabs_helper({
    institutions,
    tags,
    stat: [{ entity: "institution", items: institutions }],
    about_file,
  })

  const nb_institution = institutions.length
  let key_tab = 1
  $: show_open_all_switch =
    $tab_selected.key === "institutions" && nb_institution > is_big_limit
</script>

<section class="section">
  <Title type="institution" name="Institutions" mode="main_title" />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
