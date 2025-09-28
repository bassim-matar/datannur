<script lang="ts">
  import db from '@db'
  import { whenAppReady, page, headerOpen } from '@lib/store'
  import { pluralize } from '@lib/util'
  import { entityNames } from '@lib/constant'
  import Link from '@layout/Link.svelte'
  import Icon from '@layout/Icon.svelte'

  let {
    href = $bindable(''),
    icon = $bindable(''),
    className = 'navbar-item',
    pages = $bindable([]),
    ifUse = $bindable(null),
    standard = '',
    info = '',
    children = null,
  } = $props()

  let standardReadable = $state('')
  let loading = $state(true)

  if (standard) {
    href = pluralize(standard)
    pages = [standard, pluralize(standard)]
    icon = standard
    ifUse = standard
    standardReadable = entityNames[standard] + 's'
  }

  const closeMenu = () => ($headerOpen = false)

  function click() {
    closeMenu()
    if (!href) {
      const elem = document.getElementsByClassName(
        'tab_select_btn',
      )[0] as HTMLElement | null
      elem?.click()
    }
  }

  $whenAppReady.then(() => (loading = false))
</script>

{#if !ifUse || (!loading && db.use[ifUse])}
  <Link
    {href}
    {click}
    {className}
    isActive={() => pages.includes($page)}
    entity={icon}
  >
    {#if icon}
      {#if info}
        <span class="break_line use_tooltip fix_on_mobile" title={info}>
          <Icon type={icon} />
        </span>
      {:else}
        <Icon type={icon} />
      {/if}
    {/if}

    {#if standard}
      <span>{standardReadable}</span>
    {:else}
      {@render children?.()}
    {/if}
  </Link>
{/if}

<style lang="scss">
  @use 'main.scss' as *;

  .fix_on_mobile {
    @media screen and (max-width: $menu_mobile_limit) {
      padding-left: 0.25em;
      padding-right: 0.75em;
    }
  }
</style>
