<script>
  import { router } from "@js/router"
  import { get_base_link_url } from "@js/util"

  let {
    href,
    className = "",
    click = () => false,
    isActive = () => false,
    alternative_action = false,
    children,
  } = $props()

  const base = href === "/" ? "" : get_base_link_url()

  function go_to_href(event) {
    if (event.ctrlKey || event.metaKey) return
    event.preventDefault()
    if (alternative_action) {
      alternative_action()
      return
    }
    router.navigate(href)
  }

  function on_click_event(event) {
    click(event)
    go_to_href(event)
  }
</script>

<a
  href="{base}{href}"
  class={className}
  class:is-active={isActive()}
  onclick={on_click_event}
>
  {@render children?.()}
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
