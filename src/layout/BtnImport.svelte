<script lang="ts">
  import type { Snippet } from 'svelte'
  import Button from '@layout/Button.svelte'

  let {
    onImport,
    children,
  }: { onImport: (file: File, filename: string) => void; children?: Snippet } =
    $props()

  let fileinput: HTMLInputElement | undefined = $state()

  const onFileSelected = (e: Event & { currentTarget: HTMLInputElement }) => {
    const file = e.currentTarget.files?.[0]
    const filename = fileinput?.value.split('\\').slice(-1)[0]
    if (file && filename) onImport(file, filename)
  }
</script>

<Button onclick={() => fileinput?.click()}>
  {@render children?.()}
</Button>

<input
  style="display:none"
  type="file"
  onchange={e => onFileSelected(e)}
  bind:this={fileinput}
/>
