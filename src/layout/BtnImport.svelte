<script>
  let { on_import, children } = $props()

  let fileinput = $state()

  const onFileSelected = (e) => {
    let file = e.target.files[0]
    let filename = fileinput.value.split("\\").slice(-1)[0]
    on_import(file, filename)
  }
</script>

<button class="button" onclick={() => fileinput.click()}>
  {@render children?.()}
</button>

<input
  style="display:none"
  type="file"
  onchange={(e) => onFileSelected(e)}
  bind:this={fileinput}
/>
