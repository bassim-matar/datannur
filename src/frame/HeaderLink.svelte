<script>
  import db from "@db"
  import { page_name, header_open } from "@js/store"
  import { pluralize } from "@js/util"
  import { entity_names } from "@js/constant"
  import Link from "@layout/Link.svelte"
  import Icon from "@layout/Icon.svelte"

  let {
    href = $bindable(""),
    icon = $bindable(false),
    className = "navbar-item",
    pages = $bindable([]),
    if_use = $bindable(false),
    standard = false,
    info = false,
    children,
  } = $props()

  let standard_readable = $state(false)
  let loading = $state(true)

  if (standard) {
    href = pluralize(standard)
    pages = [standard, pluralize(standard)]
    icon = standard
    if_use = standard
    standard_readable = entity_names[standard] + "s"
  }

  const close_menu = () => ($header_open = false)

  function click() {
    close_menu()
    if (!href) {
      document.getElementsByClassName("tab_select_btn")[0]?.click()
    }
  }

  db.loaded.then(() => (loading = false))
</script>

{#if !if_use || (!loading && db.use[if_use])}
  <Link
    {href}
    {click}
    {className}
    isActive={() => pages.includes($page_name)}
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
      <span>{standard_readable}</span>
    {:else}
      {@render children?.()}
    {/if}
  </Link>
{/if}

<style lang="scss">
  @use "../main.scss" as *;

  .fix_on_mobile {
    @media screen and (max-width: $menu_mobile_limit) {
      padding-left: 0.25em;
      padding-right: 0.75em;
    }
  }
</style>
