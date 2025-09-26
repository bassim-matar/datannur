<script lang="ts">
  import { copyTextClasses, copyTextMsg } from '@lib/copy-text'

  let { text } = $props()
</script>

<span class={copyTextClasses} title={copyTextMsg}>{text}</span>
