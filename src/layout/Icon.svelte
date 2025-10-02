<script lang="ts">
  import { entityToIconName } from '@lib/util'

  let {
    type,
    marginRight = true,
    marginLeft = false,
    mode = 'normal',
  } = $props()

  const icon = $derived(entityToIconName(type))
  const classNames = $derived(
    icon.startsWith('fa-brands') ? icon : `fas fa-${icon}`,
  )
</script>

{#if type}
  <span
    class="icon icon-{type} {mode}"
    class:no-margin-right={!marginRight}
    class:with-margin-left={marginLeft}
    class:main-title={mode === 'mainTitle'}
    class:compact={mode === 'compact'}
  >
    <i class={classNames}></i>
  </span>
{/if}

<style lang="scss">
  @use 'main.scss' as *;
  @use '../style/icon.scss' as *;

  @include icon-color;

  span.icon {
    width: auto;
    min-width: 1.5rem;
    transition: $transition-basic-1;
    &.no-margin-right {
      margin-right: auto;
    }
    &.with-margin-left {
      margin-left: 10px;
    }
    &.main-title {
      width: 30px;
    }
    &.compact {
      min-width: auto;
    }
  }

  :global(.active) .icon,
  :global(.navbar-item .is-active) .icon,
  :global(a.is-active) .icon {
    text-shadow: 0 0 10px;
  }
</style>
