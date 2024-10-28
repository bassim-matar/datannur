<script>
  import { onMount } from "svelte"
  import db from "@db"
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import MdContent from "@layout/MdContent.svelte"
  import { page_content_loaded } from "@js/store"

  let { info } = $props()

  let content = $state()

  let raw_content = db.get_config(info)

  $effect(() => {
    content = raw_content?.replaceAll(
      "{dark_mode}",
      $dark_mode_theme === "dark" ? "_dark" : "",
    )
    if (!content) {
      content = `"${info}" not found in config`
    }
  })

  onMount(() => {
    $page_content_loaded = true
  })
</script>

<MdContent {content} />
