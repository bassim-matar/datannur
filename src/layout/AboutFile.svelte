<script>
  import { onMount } from "svelte"
  import MdContent from "@layout/MdContent.svelte"
  import { page_content_loaded } from "@js/store"

  export let about_file

  let content = about_file

  if (!content) {
    content = `"${info}" not found`
  }

  onMount(() => {
    $page_content_loaded = true
  })
</script>

<MdContent {content} />
