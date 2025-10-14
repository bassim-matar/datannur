<script lang="ts">
  import { entityToIconName } from '@lib/util'
  import { entityToIcon } from '@lib/constant'

  let {
    type,
    marginRight = true,
    marginLeft = false,
    mode = 'normal',
  }: {
    type: keyof typeof entityToIcon | string
    marginRight?: boolean
    marginLeft?: boolean
    mode?: 'normal' | 'mainTitle' | 'compact'
  } = $props()

  const icon = $derived(entityToIconName(type))
  const classNames = $derived(
    icon.startsWith('fa-brands') ? icon : `fas fa-${icon}`,
  )

  let isWithSvg = $state(false)
  if (['github', 'md'].includes(type)) isWithSvg = true
</script>

{#if type}
  <span
    class="icon icon-{type} {mode}"
    class:no-margin-right={!marginRight}
    class:with-margin-left={marginLeft}
    class:main-title={mode === 'mainTitle'}
    class:compact={mode === 'compact'}
    class:svg-icon={isWithSvg}
  >
    {#if isWithSvg}
      <svg><use href={`#icon-${icon}`} /></svg>
    {:else}
      <i class={classNames}></i>
    {/if}
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
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.svg-icon {
      vertical-align: middle;
    }

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

    svg {
      width: 1em;
      height: 1em;
      fill: currentColor;
    }
  }

  :global(.active) .icon,
  :global(.navbar-item .is-active) .icon,
  :global(a.is-active) .icon {
    text-shadow: 0 0 10px;
  }
</style>
