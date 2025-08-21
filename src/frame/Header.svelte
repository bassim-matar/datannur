<script>
  import db from "@db"
  import { nb_favorite, header_open, page_name } from "@js/store"
  import { router } from "@js/router.svelte.js"
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import { get_is_small_menu } from "@js/util"
  import logo from "@img/logo.png"
  import logo_dark from "@img/logo_dark.png"
  import Loading from "@frame/Loading.svelte"
  import SearchBar from "@search/SearchBar.svelte"
  import MainFilter from "@component/MainFilter.svelte"
  import HeaderDropdown from "./HeaderDropdown.svelte"
  import HeaderLink from "./HeaderLink.svelte"
  import Link from "@layout/Link.svelte"
  import Footer from "@frame/Footer.svelte"

  let scroll_y = $state(0)
  let loading = $state(true)
  let is_small_menu = $state(get_is_small_menu())

  let on_page_search = $derived($page_name === "search")
  let on_homepage = $derived($page_name === "homepage")
  let logo_src = $derived($dark_mode_theme === "dark" ? logo_dark : logo)

  const toggle_header = () => ($header_open = !$header_open)
  const close_menu = () => ($header_open = false)
  const on_resize = () => {
    is_small_menu = get_is_small_menu()
  }

  function click_on_main_logo() {
    close_menu()
    if ($page_name !== "homepage") {
      router.navigate("/")
      return
    }
    document
      .querySelector(".tabs_container_ul .tab_entity_about a.tab_select_btn")
      ?.click()
  }

  db.loaded.then(() => (loading = false))
</script>

<svelte:window bind:scrollY={scroll_y} onresize={on_resize} />

<nav
  class="navbar is-fixed-top"
  class:header_open={$header_open}
  class:header_on_top={scroll_y < 10 || $header_open}
  class:box_shadow={scroll_y >= 10 && !$header_open}
  style="max-height: 48px; min-height: 48px;"
>
  <div class="navbar-brand">
    <Link
      href=""
      className="navbar-item"
      alternative_action={click_on_main_logo}
    >
      <img src={logo_src} class="header_logo" alt="logo" />
    </Link>

    <div class="mobile_right_btn">
      {#if !on_page_search && !on_homepage}
        <div class="search_bar_btn_wrapper">
          <HeaderLink href="search" pages={["search"]}>
            <i class="fas fa-magnifying-glass"></i>
          </HeaderLink>
        </div>
      {/if}

      <button
        class="navbar-burger"
        class:is-active={$header_open}
        aria-label="menu"
        onclick={toggle_header}
      >
        <span></span><span></span><span></span>
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

      <HeaderLink
        href="favorite"
        pages={["favorite"]}
        icon="favorite"
        info="Favoris"
        ><span class="visible_on_mobile">Favoris</span><span
          class="num_style favorite_number">{$nb_favorite}</span
        ></HeaderLink
      >

      <HeaderLink href="about" pages={["about"]} icon="about" info="A propos">
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
      {#if is_small_menu}
        <Footer menu_mobile={true} />
      {/if}
    </div>
  </div>
</nav>

{#if (is_small_menu && (on_page_search || on_homepage)) || !is_small_menu}
  <SearchBar {close_menu} {is_small_menu} />
{/if}

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
    .favorite_number {
      padding-left: 8px;
      height: 1rem;
    }
  }

  :global(html.rounded_design) {
    .navbar-menu.is-active {
      border-radius: $rounded-bottom;
    }
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
