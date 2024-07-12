<script>
  import { get_base_link_url } from "@js/util"

  export let href
  export let className = ""
  export let click = () => false
  export let isActive = () => false

  let base
  if (href == "/") base = ""
  else base = get_base_link_url()

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
