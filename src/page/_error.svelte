<script>
  import { onMount } from "svelte"
  import { footer_visible, page_content_loaded } from "@js/store"
  import Error from "@frame/Error.svelte"

  let { entity = "page" } = $props()

  $footer_visible = true

  onMount(() => ($page_content_loaded = true))
</script>

<Error type={entity} />
