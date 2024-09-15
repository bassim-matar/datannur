<script>
  import jQuery from "jquery"
  import "jquery-powertip"
  import db from "@db"
  import {
    page_hash,
    footer_visible,
    page_content_loaded,
    search_value,
  } from "@js/store"
  import Router from "@frame/Router.svelte"
  import Options from "@js/Options"
  import Logs from "@js/Logs"
  import Favorites from "@favorite/Favorites"
  import Main_filter from "@js/Main_filter"
  import { is_http, has_touch_screen } from "@js/util"
  import { url_param } from "@js/url_param"
  import { url_hash } from "@js/url_hash"
  import { db_add_processed_data, get_user_data } from "@js/db"
  import icon from "@img/icon.png"
  import icon_dark from "@img/icon_dark.png"
  import Loading from "@page/_loading.svelte"
  import Search from "@search/Search"
  import SearchHistory from "@search/SearchHistory"
  import { Dark_mode, dark_mode_theme } from "@dark_mode/Dark_mode"
  import Header from "@frame/Header.svelte"
  import Footer from "@frame/Footer.svelte"
  import { copy_text_listen_click } from "@js/copy_text"

  function set_option_default(key, value = true) {
    let option_value = Options.get(key)
    if (option_value === undefined) {
      option_value = value
      Options.set(key, value)
    }
    if (option_value) {
      document.documentElement.classList.add(key)
    }
    return option_value
  }

  Options.loaded = (async () => {
    await Options.init()
    set_option_default("rounded_design")
    set_option_default("open_all_recursive")
    set_option_default("page_shadow_colored", false)
  })()

  Dark_mode.init(Options)

  db.search = async () => {}
  db.loaded = (async () => {
    await Main_filter.init()
    const filter = {
      entity: "dataset",
      variable: "type",
      values: Main_filter.get_type_to_filter(),
    }
    let timer = performance.now()
    await db.init({ filter })
    console.log("db init", Math.round(performance.now() - timer) + " ms")
    const user_data = await get_user_data()
    db.add_meta(user_data)
    timer = performance.now()
    db_add_processed_data()
    console.log("db process", Math.round(performance.now() - timer) + " ms")
    timer = performance.now()
    const search = new Search()
    search.init()
    db.search = async (...args) => await search.search(...args)
    Logs.init(user_data.log)
    Favorites.init(user_data.favorite)
    SearchHistory.init(user_data.search_history, { limit: 100 })
  })()

  async function check_from_search(page_hash_value) {
    await db.loaded
    const from_search = url_param.get("from_search")
    if (from_search) {
      const entity = page_hash_value
      const entity_id = url_hash.get_level_2()
      SearchHistory.add(entity, entity_id)
      Logs.add("search_bar", { entity, entity_id })
      $search_value = ""
      url_param.delete("from_search")
      url_param.delete("search")
    }
  }

  $page_hash = url_hash.get_level_1()
  page_hash.subscribe(page_hash_value => check_from_search(page_hash_value))

  if (has_touch_screen) {
    document.documentElement.classList.toggle("has_touch_screen")
  }

  let page_loaded_route
  $: if ($page_content_loaded !== false) {
    if (window.location.hash) {
      page_loaded_route = window.location.hash.split("#/")[1].split("?")[0]
    } else {
      page_loaded_route = window.location.pathname.substring(1)
    }
    page_loaded_route = page_loaded_route.replace("/", "___")
  }

  const is_dark = $dark_mode_theme === "dark"
  const main_banner = new Image()
  main_banner.src = `data/img/main_banner${is_dark ? "_dark" : ""}.png?v=1`
  main_banner.onload = () => {
    const css_var_style = document.documentElement.style
    css_var_style.setProperty("--main_banner_width", main_banner.width)
    css_var_style.setProperty("--main_banner_height", main_banner.height)
  }
  const favicon = is_dark ? icon_dark : icon

  jQuery("body").on("mouseover", ".use_tooltip", function () {
    const elem = jQuery(this)
    if (!elem?.data("powertip_initialized")) {
      elem?.data("powertip_initialized", true)
      elem?.powerTip({
        placement: elem.hasClass("tooltip_top") ? "n" : "s",
        smartPlacement: true,
      })
      elem?.powerTip("show")
    }
  })

  copy_text_listen_click()
</script>

<svelte:head>
  <link href={favicon} rel="shortcut icon" type="image/png" />
  {#if is_http}
    <link href="manifest.json?v=6" rel="manifest" />
  {/if}
</svelte:head>

{#await Options.loaded then}
  <Header />
  <div id="wrapper" class:no_footer={!$footer_visible}>
    {#await db.loaded}
      <Loading />
    {:then}
      <Router />
      <div id="db_loaded" style="display: none;"></div>
      <div
        id="page_loaded_route_{page_loaded_route}"
        style="display: none;"
      ></div>
    {/await}
  </div>
  <Footer />
{/await}
