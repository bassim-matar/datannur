<script>
  import { onDestroy } from "svelte"
  import Logs from "@js/Logs"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import { url_param } from "@js/url_param"

  let logs
  let tabs
 
  function init() {
    logs = Logs.get_all()
    tabs = tabs_helper({
      options: "",
      // options_export: "",
      // options_import: "",
      logs,
      stat: [{entity: "log", items: logs}],
      info: "about_options",
    })
  }

  function is_tab_logs_selected() {
    return url_param.get("tab") === "logs"
  }

  init()
  Logs.on_change(() => {
    setTimeout(() => {
      if(is_tab_logs_selected()) init()
    }, 10)
  })

  onDestroy(() => {
    Logs.off_change()
  })
</script>

<section class="section">
  <Title type="option" name="Options" mode="main_title" />
  <Tabs {tabs} />
</section>
