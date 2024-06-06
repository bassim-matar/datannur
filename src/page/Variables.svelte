<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"

  const variables = db.get_all("variable")
  const tags = db.get_all("tag").filter(tag => tag.nb_variable > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const tabs = tabs_helper({
    variables,
    tags,
    stat: [{ entity: "variable", items: variables }],
    info: "about_variable",
  })
</script>

<section class="section">
  <Title type="variable" name="Variables" mode="main_title" />
  <Tabs {tabs} />
</section>
