<script>
  import db from "@db"
  import { nb_favorite, header_open, page_name } from "@js/store"
  import { router } from "@js/router"
  // import { subfolder } from "@js/util"
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import logo from "@img/logo.png"
  import logo_dark from "@img/logo_dark.png"
  import Loading from "@frame/Loading.svelte"
  import SearchBar from "@search/SearchBar.svelte"
  import MainFilter from "@component/MainFilter.svelte"
  import HeaderDropdown from "./HeaderDropdown.svelte"
  import HeaderLink from "./HeaderLink.svelte"

  const toggle_header = () => ($header_open = !$header_open)
  const close_menu = () => ($header_open = false)

  function go_to_homepage() {
    let url = "/"
    // if (subfolder) url = `/?homepage`
    router.navigate(url)
  }

  let scroll_y = 0

  $: on_page_search = $page_name === "search"
  $: logo_src = $dark_mode_theme === "dark" ? logo_dark : logo

  let loading = true
  db.loaded.then(() => (loading = false))
</script>

<svelte:window bind:scrollY={scroll_y} />

<div class="navbar_menu_open_space" class:header_open={$header_open} />

<nav
  class="navbar is-fixed-top"
  class:header_open={$header_open}
  class:header_on_top={scroll_y < 10 || $header_open}
  class:box_shadow={scroll_y >= 10 && !$header_open}
  style="max-height: 48px; min-height: 48px;"
>
  <div class="navbar-brand">
    <a href="?homepage" on:click|preventDefault={go_to_homepage} class="navbar-item" >
      <img src={logo_src} class="header_logo" alt="logo" />
    </a>

    <div class="mobile_right_btn">
      {#if !on_page_search}
        <div class="search_bar_btn_wrapper">
          <HeaderLink href="search" pages={["search"]}>
            <i class="fas fa-magnifying-glass" />
          </HeaderLink>
        </div>
      {/if}

      <button
        class="navbar-burger"
        class:is-active={$header_open}
        on:click={toggle_header}
      >
        <span /><span /><span />
      </button>
    </div>
  </div>

  <div
    class="navbar-menu"
    class:box_shadow={$header_open}
    class:is-active={$header_open}
  >
    <div class="navbar-start">
      {#if loading}
        <div class="navbar-item">
          <Loading type="mini" />
        </div>
      {/if}

      <HeaderDropdown
        title="Organisation"
        pages={[
          "institution",
          "institutions",
          "folder",
          "folders",
          "tag",
          "tags",
          "doc",
          "docs",
        ]}
        if_use={["institution", "folder", "tag", "doc"]}
      >
        <HeaderLink standard="institution" />
        <HeaderLink standard="folder" />
        <HeaderLink standard="tag" />
        <HeaderLink standard="doc" />
      </HeaderDropdown>

      <HeaderDropdown
        title="Datasets"
        pages={[
          "dataset",
          "datasets",
          "variable",
          "variables",
          "modality",
          "modalities",
        ]}
        if_use={["dataset", "variable", "modality"]}
      >
        <HeaderLink standard="dataset" />
        <HeaderLink standard="variable" />
        <HeaderLink standard="modality" />
      </HeaderDropdown>

      <HeaderDropdown title="Filtre" if_use={["filter"]}>
        <MainFilter />
      </HeaderDropdown>

      <HeaderLink href="favorite" pages={["favorite"]} icon="favorite">
        <span>
          Favoris
          {#if loading}
            &nbsp;<Loading type="mini" position="relative" />
          {:else}
            <span class="num_style">{$nb_favorite}</span>
          {/if}
        </span>
      </HeaderLink>

      {#if loading}
        <div class="navbar-item">
          <Loading type="mini" />
        </div>
      {/if}

      <HeaderLink
        href="about"
        pages={["about"]}
        icon="about"
        if_use="about"
        info="A propos"
      >
        <span class="visible_on_mobile">A propos</span>
      </HeaderLink>

      <HeaderLink
        href="options"
        pages={["options"]}
        icon="option"
        info="Options"
      >
        <span class="visible_on_mobile">Options</span>
      </HeaderLink>
    </div>

    <div class="navbar-end">
      {#if !on_page_search}
        <div class="navbar-item search_bar_input_wrapper">
          <SearchBar {close_menu} />
        </div>
      {/if}
    </div>
  </div>
</nav>

<style lang="scss">
  @use "../main.scss" as *;

  .navbar {
    background: $background-1;
    border-bottom: 1px solid $color-5;
    border-color: $color-5;
    transition:
      border-color $transition-basic-1,
      box-shadow $transition-basic-1;
    &.header_on_top {
      border-color: $background-1;
    }
    .navbar-brand {
      min-height: auto;
      height: 47px;
      padding-left: 3rem;
      justify-content: space-between;
      .mobile_right_btn {
        display: flex;
      }
      :global(a:nth-child(1)) {
        padding-left: 0;
        padding-top: 0;
      }
      img {
        height: 20px;
        transition: $transition-basic-1;
      }
      .navbar-burger:hover {
        background: none;
      }
    }
    .navbar-menu {
      background: $background-1;
      .navbar-end {
        padding-right: 0;
        margin-left: 10px;
      }
      &.is-active .navbar-end {
        margin-left: auto;
      }
    }
  }

  :global(html.rounded_design) {
    .navbar-menu.is-active {
      border-radius: $rounded-bottom;
    }
  }

  .search_bar_input_wrapper {
    display: block;
    padding: 0;
  }
  .search_bar_btn_wrapper {
    display: none;
    width: 20px;
    z-index: 100;
    :global(a.is-active) {
      color: color("search") !important;
      text-shadow: 0 0 10px;
    }
  }
  @media screen and (max-width: $menu_mobile_limit) {
    .search_bar_input_wrapper {
      display: none;
    }
    .search_bar_btn_wrapper {
      display: block;
    }
    .navbar .navbar-brand .search_bar_btn_wrapper {
      padding-top: 16px;
    }
    .navbar .navbar-brand {
      .mobile_right_btn {
        padding-right: 2rem;
      }
    }
    .navbar-menu {
      padding-left: 1.75rem;
      padding-right: 1.75rem;
      margin-left: 7px;
      margin-right: 7px;
    }
  }

  @media screen and (max-width: 600px) {
    .navbar .navbar-brand {
      padding-left: 15px;
      padding-right: 0;
      .mobile_right_btn {
        padding-right: 0;
      }
    }
    .navbar-menu {
      padding-left: 3px;
      padding-right: 3px;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .visible_on_mobile {
    display: none;
    @media screen and (max-width: $menu_mobile_limit) {
      display: initial;
    }
  }
</style>
