<script>
  import { app_mode } from "@js/util"

  export let href
  export let className = ""
  export let click = () => false
  export let isActive = () => false

  let base

  if (app_mode === "static_render") {
    base = ""
  } else {
    base = "#!/"
  }
  if (href == "/") base = ""
  function blur(e) {
    this.blur()
  }
</script>

<a
  href="{base}{href}"
  class={className}
  class:is-active={isActive()}
  on:click={blur}
  on:click={click}
>
  <slot />
</a>

<style lang="scss">
  @import "../main.scss";

  a {
    text-decoration: none;
    transition: $transition-basic-1;
    &:hover,
    &:focus-within,
    &.is-active {
      color: $color-3 !important;
      background: initial !important;
    }
  }
</style>
