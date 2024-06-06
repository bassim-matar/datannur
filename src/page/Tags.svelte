<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import OpenAllSwitch from "@layout/OpenAllSwitch.svelte"

  const tags = db.get_all("tag")
  if (db.use.tag_recursive) {
    make_parents_relative(0, tags)
    add_minimum_deep(tags)
  }

  const tabs = tabs_helper({
    tags,
    stat: [{ entity: "tag", items: tags }],
    info: "about_tag",
  })

  let key_tab = 1
</script>

<section class="section">
  <Title type="tag" name="Mots clés" mode="main_title" />
  <OpenAllSwitch on_change={value => (key_tab = value)} />
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
