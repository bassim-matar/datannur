<script>
  import db from "@db"
  import { page_name } from "@js/store"

  export let title
  export let pages = []
  export let if_use = false

  let visible = !if_use
  let loading = true

  db.loaded.then(() => {
    loading = false
    if (!if_use) return
    for (const use of if_use) {
      if (db.use[use]) visible = true
    }
  })
</script>

{#if visible}
  <div class="navbar-item has-dropdown is-hoverable">
    <div class="navbar-link" class:is-active={pages.includes($page_name)}>
      <span>{title}</span>
    </div>
    <div class="navbar-dropdown box_shadow">
      <slot />
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../main.scss" as *;

  .navbar-link:not(.is-arrowless)::after{
    border-color: $color-3;
  }

  .navbar-item.has-dropdown:hover .navbar-link,
  .navbar-link.is-active,
  .navbar-link:focus,
  .navbar-link:focus-within,
  .navbar-link:hover {
    color: $color-3;
    background: $background-1;
  }

  .navbar-link {
    transition: $transition-basic-1;
  }

  .navbar-dropdown {
    border-top: 0;
    color: $color-3;
    background: $background-1;
  }

  :global(.header_open) {
    .navbar-dropdown.box_shadow {
      box-shadow: none;
    }
  }

  :global(html.rounded_design) {
    .navbar-dropdown {
      border-radius: $rounded-bottom;
    }
  }
</style>
