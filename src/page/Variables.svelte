<script lang="ts">
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@lib/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_variable.md?raw"

  const variables = db.get_all("variable")
  const tags = db.get_all("tag").filter(tag => tag.nb_variable > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const evolutions = db
    .get_all("evolution")
    .filter(evo => evo.entity === "variable")

  const tabs = tabs_helper({
    variables,
    tags,
    evolutions,
    stat: [{ entity: "variable", items: variables }],
    about_file,
  })
</script>

<section class="section">
  <Title type="variable" name="Variables" mode="main_title" />
  <Tabs {tabs} />
</section>
