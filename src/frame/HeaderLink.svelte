<script>
  import db from "@db"
  import { page_name, header_open } from "@js/store"
  import { pluralize } from "@js/util"
  import { entity_names } from "@js/constant"
  import Link from "@layout/Link.svelte"
  import Icon from "@layout/Icon.svelte"

  export let href = ""
  export let icon = false
  export let className = "navbar-item"
  export let pages = []
  export let if_use = false
  export let standard = false
  export let info = false

  let standard_readable = false

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

  let loading = true
  db.loaded.then(() => (loading = false))
</script>

{#if !if_use || (!loading && db.use[if_use])}
  <Link {href} {click} {className} isActive={() => pages.includes($page_name)}>
    {#if icon}
      {#if info}
        <span
          class="break_line use_tooltip fix_on_mobile"
          title={info}
        >
          <Icon type={icon} />
        </span>
      {:else}
        <Icon type={icon} />
      {/if}
    {/if}

    {#if standard}
      <span>{standard_readable}</span>
    {:else}
      <slot />
    {/if}
  </Link>
{/if}

<style lang="scss">
  @import "../main.scss";
  .fix_on_mobile {
    @media screen and (max-width: $menu_mobile_limit) {
      padding-left: 0.25em;
      padding-right: 0.75em;
    }
  }
</style>
