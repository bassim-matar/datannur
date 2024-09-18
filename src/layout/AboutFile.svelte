<script>
  import { onMount } from "svelte"
  import MdContent from "@layout/MdContent.svelte"
  import { page_content_loaded } from "@js/store"
  import { dark_mode_theme } from "@dark_mode/Dark_mode"

  export let about_file

  let content = about_file

  $: content = about_file?.replace(
    "{dark_mode}",
    $dark_mode_theme === "dark" ? "_dark" : "",
  )

  if (!content) {
    content = `"${info}" not found`
  }

  onMount(() => {
    $page_content_loaded = true
  })
</script>

<MdContent {content} />
