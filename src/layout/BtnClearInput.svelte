<script>
  export let click
  export let mode = "normal"
</script>

<button
  on:click={click}
  class="btn_clear_input {mode}"
  aria-label="clear_input"
>
  <i class="fa-solid fa-xmark"></i>
</button>

<style lang="scss">
  @use "../main.scss" as *;

  button {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    padding-right: 20px;
    z-index: 1;
    color: $color-2;
    cursor: pointer;
    &.mini {
      display: none;
      padding-right: 10px;
    }
    &:hover {
      text-shadow: 0 0 10px;
    }
  }
</style>
