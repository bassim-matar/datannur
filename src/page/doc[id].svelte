<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  let { doc } = $props()

  const institutions = db.get_all("institution", { doc })
  const folders = db.get_all("folder", { doc })
  const tags = db.get_all("tag", { doc })
  const datasets = db.get_all("dataset", { doc })

  make_parents_relative(false, institutions)
  make_parents_relative(false, folders)
  make_parents_relative(false, tags)

  add_minimum_deep(institutions)
  add_minimum_deep(folders)
  add_minimum_deep(tags)

  const history = db
    .get_all("history")
    .filter(history => history.entity === "doc" && history.id === doc.id)

  let tabs = tabs_helper({
    doc,
    institutions,
    folders,
    tags,
    datasets,
    history,
  })
</script>

<section class="section">
  <Title type="doc" name={doc.name} id={doc.id} />
  <Tabs {tabs} />
</section>
