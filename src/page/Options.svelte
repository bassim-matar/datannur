<script lang="ts">
  import Logs from "@lib/Logs"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_options.md?raw"

  let logs = Logs.get_all()
  let tabs = tabs_helper({
    options: "",
    logs,
    stat: [{ entity: "log", items: logs }],
    about_file,
  }) 
</script>

<section class="section">
  <Title type="option" name="Options" mode="main_title" />
  <Tabs {tabs} />
</section>
