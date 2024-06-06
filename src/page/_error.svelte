<script>
  import { onMount } from "svelte"
  import { footer_visible, page_content_loaded } from "@js/store"
  import Error from "@frame/Error.svelte"

  export let entity = "page"

  $footer_visible = true

  onMount(() => {
    $page_content_loaded = true
  })
</script>

<Error type={entity} />
