<script>
  import db from "@db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"

  const docs = db.get_all("doc")
  const tabs = tabs_helper({
    docs,
    stat: [{ entity: "doc", items: docs }],
    info: "about_doc",
  })
</script>

<section class="section">
  <Title type="doc" name="Docs" mode="main_title" />
  <Tabs {tabs} />
</section>
