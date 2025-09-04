<script lang="ts">
  import Button from "@layout/Button.svelte"

  let { on_import, children } = $props()

  let fileinput: HTMLInputElement = $state()

  const onFileSelected = e => {
    let file = e.target.files[0]
    let filename = fileinput.value.split("\\").slice(-1)[0]
    on_import(file, filename)
  }
</script>

<Button onclick={() => fileinput.click()}>
  {@render children?.()}
</Button>

<input
  style="display:none"
  type="file"
  onchange={e => onFileSelected(e)}
  bind:this={fileinput}
/>
