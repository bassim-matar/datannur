<script lang="ts">
  import { copyTextClasses, copyTextMsg } from '@lib/copy-text'

  let { text }: { text: string | number | undefined } = $props()
</script>

<span class={copyTextClasses} title={copyTextMsg}>{text}</span>
