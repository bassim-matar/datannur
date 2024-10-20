<script>
  import db from "@db"
  import { tab_selected } from "@js/store"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import { is_big_limit } from "@js/constant"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import OpenAllSwitch from "@layout/OpenAllSwitch.svelte"
  import about_file from "@markdown/about_folder.md?raw"

  const folders = db.get_all("folder")
  make_parents_relative(0, folders)
  add_minimum_deep(folders)

  const tags = db.get_all("tag").filter(tag => tag.nb_folder > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  let tabs = tabs_helper({
    folders,
    tags,
    stat: [{ entity: "folder", items: folders }],
    about_file,
  })

  const nb_folder = folders.length
  let key_tab = 1
  $: show_open_all_switch =
    $tab_selected.key === "folders" && nb_folder > is_big_limit
</script>

<section class="section">
  <Title type="folder" name="Dossiers" mode="main_title" />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
