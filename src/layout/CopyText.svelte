<script>
  import { copy_text_classes, copy_text_msg } from "@js/copy_text"

  export let text
</script>

<span class={copy_text_classes} title={copy_text_msg}>{text}</span>
