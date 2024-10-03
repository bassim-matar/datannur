<script>
  import { router } from "@js/router"
  import { get_base_link_url } from "@js/util"

  export let href
  export let className = ""
  export let click = () => false
  export let isActive = () => false
  export let alternative_action = false

  let base
  if (href == "/") base = ""
  else base = get_base_link_url()

  function blur(e) {
    this.blur()
  }
  function go_to_href(event) {
    if (event.ctrlKey || event.metaKey) return
    event.preventDefault()
    if (alternative_action) {
      alternative_action()
      return
    }
    router.navigate(href)
  }
</script>

<a
  href="{base}{href}"
  class={className}
  class:is-active={isActive()}
  on:click={blur}
  on:click={click}
  on:click={go_to_href}
>
  <slot />
</a>

<style lang="scss">
  @use "../main.scss" as *;

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
