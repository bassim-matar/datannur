<script>
  import db from "@db"
  import { tab_selected } from "@js/store"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import { is_big_limit } from "@js/constant"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import OpenAllSwitch from "@layout/OpenAllSwitch.svelte"
  import about_file from "@markdown/about_tag.md?raw"

  const tags = db.get_all("tag")
  if (db.use.tag_recursive) {
    make_parents_relative(0, tags)
    add_minimum_deep(tags)
  }

  const tabs = tabs_helper({
    tags,
    stat: [{ entity: "tag", items: tags }],
    about_file,
  })

  let key_tab = 1
  const nb_tags = tags.length
  $: show_open_all_switch =
    $tab_selected.key === "tags" && nb_tags > is_big_limit
</script>

<section class="section">
  <Title type="tag" name="Mots clés" mode="main_title" />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
