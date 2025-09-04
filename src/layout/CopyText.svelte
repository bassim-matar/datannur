<script lang="ts">
  import { copy_text_classes, copy_text_msg } from "@lib/copy_text"

  let { text } = $props()
</script>

<span class={copy_text_classes} title={copy_text_msg}>{text}</span>
