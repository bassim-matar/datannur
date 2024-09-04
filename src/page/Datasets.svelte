<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"

  const datasets = db.get_all("dataset")
  const tags = db.get_all("tag").filter(tag => tag.nb_dataset > 0)
  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const tabs = tabs_helper({
    datasets,
    tags,
    stat: [{ entity: "dataset", items: datasets }],
    info: "about_dataset",
  })
</script>

<section class="section">
  <Title type="dataset" name="Datasets" mode="main_title" />
  <Tabs {tabs} />
</section>
