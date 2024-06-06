<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  export let doc

  const institutions = db.get_all("institution", { doc })
  const folders = db.get_all("folder", { doc })
  const datasets = db.get_all("dataset", { doc })

  make_parents_relative(false, folders)
  make_parents_relative(false, institutions)

  add_minimum_deep(institutions)
  add_minimum_deep(folders)

  let tabs = tabs_helper({
    doc_info: doc,
    institutions,
    folders,
    datasets,
  })
</script>

<section class="section">
  <Title type="doc" name={doc.name} id={doc.id} />
  <Tabs {tabs} />
</section>
