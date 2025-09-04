<script lang="ts">
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@lib/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_dataset.md?raw"

  const datasets = db.get_all("dataset")
  const tags = db.get_all("tag").filter(tag => tag.nb_dataset > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const evolutions = db
    .get_all("evolution")
    .filter(evo => evo.entity === "dataset")

  const tabs = tabs_helper({
    datasets,
    tags,
    evolutions,
    stat: [{ entity: "dataset", items: datasets }],
    about_file,
  })
</script>

<section class="section">
  <Title type="dataset" name="Datasets" mode="main_title" />
  <Tabs {tabs} />
</section>
