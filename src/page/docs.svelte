<script>
  import db from "@db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_doc.md?raw"

  const docs = db.get_all("doc")

  const evolutions = db.get_all("evolution").filter(evo => evo.entity === "doc")

  const tabs = tabs_helper({
    docs,
    evolutions,
    stat: [{ entity: "doc", items: docs }],
    about_file,
  })
</script>

<section class="section">
  <Title type="doc" name="Docs" mode="main_title" />
  <Tabs {tabs} />
</section>
