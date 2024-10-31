<script>
  import { entity_to_icon_name } from "@js/util"

  let {
    type,
    margin_right = true,
    margin_left = false,
    mode = "normal",
  } = $props()

  let fa_type = "fas"
  let icon = entity_to_icon_name(type)
  let class_names = icon.startsWith("fa-brands") ? icon : `${fa_type} fa-${icon}`
</script>

{#if type}
  <span
    class="icon icon_{type} {mode}"
    class:no_margin_right={!margin_right}
    class:with_margin_left={margin_left}
  >
    <i class={class_names}></i>
  </span>
{/if}

<style lang="scss">
  @use "../main.scss" as *;
  @use "../style/icon.scss" as *;

  @include icon-color;

  span.icon {
    width: auto;
    min-width: 1.5rem;
    transition: $transition-basic-1;
    &.no_margin_right {
      margin-right: auto;
    }
    &.with_margin_left {
      margin-left: 10px;
    }
    &.main_title {
      width: 30px;
    }
  }

  :global(.active) .icon,
  :global(.navbar-item .is-active) .icon,
  :global(.tabs .is-active) .icon,
  :global(a.is-active) .icon {
    text-shadow: 0 0 10px;
  }
</style>
