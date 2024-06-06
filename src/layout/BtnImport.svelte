<script>
  export let on_import

  let fileinput

  const onFileSelected = (e) => {
    let file = e.target.files[0]
    let filename = fileinput.value.split("\\").slice(-1)[0]
    on_import(file, filename)
  }
</script>

<button class="button" on:click={() => fileinput.click()}>
  <slot />
</button>
<input
  style="display:none"
  type="file"
  on:change={(e) => onFileSelected(e)}
  bind:this={fileinput}
/>
