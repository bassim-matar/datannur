<script>
  import { onDestroy } from "svelte"
  import jQuery from "jquery"
  import "jquery-powertip"
  import db from "@db"
  import {
    page_hash,
    footer_visible,
    page_content_loaded,
  } from "@js/store"
  import Options from "@js/Options"
  import Logs from "@js/Logs"
  import Favorites from "@favorite/Favorites"
  import Main_filter from "@js/Main_filter"
  import { is_http, has_touch_screen, get_is_small_menu } from "@js/util"
  import { url_param } from "@js/url_param"
  import { url_hash } from "@js/url_hash"
  import { db_add_processed_data, get_user_data } from "@js/db"
  import icon from "@img/icon.png"
  import icon_dark from "@img/icon_dark.png"
  import Search from "@search/Search"
  import SearchHistory from "@search/SearchHistory"
  import { Dark_mode, dark_mode_theme } from "@dark_mode/Dark_mode"
  import { copy_text_listen_click } from "@js/copy_text"
  import { add_values_to_attribut } from "@stat/stat"
  import definition from "@stat/attributs_def"
  import default_banner from "@markdown/main/banner.md?raw"
  import Header from "@frame/Header.svelte"
  import Footer from "@frame/Footer.svelte"
  import Router from "@frame/Router.svelte"
  import Popup from "@layout/Popup.svelte"
  import Loading from "@page/_loading.svelte"
  import StatBox from "@stat/StatBox.svelte"
  import db_schema from "@src/db_schema.json" 

  let error_loading_db = $state(false)
  let page_loaded_route = $state()
  let is_small_menu = $state(get_is_small_menu())
  let is_popup_column_stat_open = $state(false)
  let column_stat_entity = $state()
  let column_stat_attribut = $state()

  const timer = performance.now()

  function on_resize() {
    is_small_menu = get_is_small_menu()
  }

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
    let timer = performance.now()
    await Options.init()
    set_option_default("rounded_design")
    set_option_default("open_all_recursive")
    set_option_default("evolution_summary", false)
    set_option_default("page_shadow_colored", false)
    console.log("init option", Math.round(performance.now() - timer) + " ms")
  })()

  Dark_mode.init(Options)

  db.search = async () => {}
  db.loaded = (async () => {
    try {
      let timer = performance.now()
      await Main_filter.init()
      const filter = {
        entity: "dataset",
        variable: "type",
        values: Main_filter.get_type_to_filter(),
      }
      console.log("init filter", Math.round(performance.now() - timer) + " ms")

      timer = performance.now()
      await db.init({ filter })
      console.log("load db", Math.round(performance.now() - timer) + " ms")

      timer = performance.now()
      const user_data = await get_user_data()
      db.add_meta(user_data, db_schema)
      db_add_processed_data()
      console.log("process db", Math.round(performance.now() - timer) + " ms")

      timer = performance.now()
      const search = new Search()
      search.init()
      db.search = async (...args) => await search.search(...args)
      Logs.init(user_data.log)
      Favorites.init(user_data.favorite)
      SearchHistory.init(user_data.search_history, { limit: 100 })
    } catch (e) {
      console.error(e)
      error_loading_db = true
    }
  })()

  async function check_from_search(page_hash_value) {
    await db.loaded
    const from_search = url_param.get("from_search")
    if (from_search) {
      const entity = page_hash_value
      const entity_id = url_hash.get_level_2()
      SearchHistory.add(entity, entity_id)
      Logs.add("search_bar", { entity, entity_id })
      url_param.delete("from_search")
      url_param.delete("search")
    }
  }

  $page_hash = url_hash.get_level_1()
  page_hash.subscribe(page_hash_value => check_from_search(page_hash_value))

  if (has_touch_screen) {
    document.documentElement.classList.toggle("has_touch_screen")
  }

  const is_dark = $dark_mode_theme === "dark"
  const favicon = is_dark ? icon_dark : icon

  jQuery("body").on("mouseover", ".use_tooltip", function () {
    const elem = jQuery(this)
    if (!elem?.data("powertip_initialized")) {
      elem?.data("powertip_initialized", true)
      elem?.powerTip({
        placement: elem.hasClass("tooltip_top") ? "n" : "s",
        smartPlacement: true,
        mouseOnToPopup: true,
      })
      elem?.powerTip("show")
    }
  })

  jQuery("body").on("click", ".column_stat_btn", function () {
    const attribut_name = jQuery(this).data("attribut")
    column_stat_entity = jQuery(this).data("entity")
    column_stat_attribut = add_values_to_attribut(window._current_tab_data, {
      key: attribut_name,
      ...definition[attribut_name],

    })
    if (column_stat_attribut) is_popup_column_stat_open = true
  })

  copy_text_listen_click()

  db.loaded.then(() => {
    const main_banner = new Image()
    let banner_src = db.table_has_id("config", "banner")
      ? db.get_config("banner")
      : default_banner
    banner_src = banner_src?.split("(")[1]?.split(")")[0]
    main_banner.src = banner_src?.replaceAll(
      "{dark_mode}",
      is_dark ? "_dark" : "",
    )
    main_banner.onload = () => {
      const css_var_style = document.documentElement.style
      css_var_style.setProperty("--main_banner_width", main_banner.width)
      css_var_style.setProperty("--main_banner_height", main_banner.height)
    }

    console.log("init total", Math.round(performance.now() - timer) + " ms")
  })

  const unsubscribe = page_content_loaded.subscribe(value => {
    if (value !== false) {
      if (window.location.hash) {
        page_loaded_route = window.location.hash.split("#/")[1].split("?")[0]
      } else {
        page_loaded_route = window.location.pathname.substring(1)
      }
      page_loaded_route = page_loaded_route.replace(/\//g, "___")
    }
  })

  onDestroy(() => {
    unsubscribe()
  })
</script>

<svelte:head>
  <link href={favicon} rel="shortcut icon" type="image/png" />
  {#if is_http}
    <link href="manifest.json?v=6" rel="manifest" />
  {/if}
</svelte:head>

<svelte:window onresize={on_resize} />

{#await Options.loaded then}
  <Header />
  <div id="wrapper" class:no_footer={!$footer_visible}>
    {#if error_loading_db}
      <div class="error_loading_db">
        <h2 class="title">Erreur de chargement</h2>
        <p>Erreur durant le chargement de la base de données.</p>
        <p>Veuillez réessayer de charger l'application plus tard.</p>
        <p>Si le problème persiste, contactez le support.</p>
      </div>
    {:else}
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
    {/if}
  </div>
  {#if !is_small_menu}
    <Footer />
  {/if}
{/await}

<Popup bind:is_open={is_popup_column_stat_open}>
  <StatBox
    entity={column_stat_entity}
    attribut={column_stat_attribut}
    with_html={column_stat_entity === "log"}
    from_popup={true}
  />
</Popup>

<style lang="scss">
  @use "../main.scss" as *;

  .error_loading_db {
    position: absolute;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 700px;
    h2 {
      color: $color-3;
    }
    p {
      margin: 0.5em 0;
    }
  }
</style>
