<script>
  import { onMount } from "svelte"
  import db from "@db"
  import { search_value, page_content_loaded } from "@js/store"
  import { clickOutside, debounce } from "@js/util"
  import { url_param } from "@js/url_param"
  import Head from "@frame/Head.svelte"
  import Loading from "@frame/Loading.svelte"
  import BtnClearInput from "@layout/BtnClearInput.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import SearchResult from "@search/SearchResult.svelte"
  import SearchHistory from "@search/SearchHistory"
  import AboutFile from "@layout/AboutFile.svelte"
  import about_search from "@markdown/search/about_search.md?raw"
  import no_result from "@markdown/search/no_result.md?raw"
  import no_recent_search from "@markdown/search/no_recent_search.md?raw"

  let is_loading = true
  let input_element
  let search_result_data = []
  let tabs = []
  let is_focus_in = false
  let recent_search_change = false
  let tab_key

  function make_tab(name, icon, key, about_file) {
    return {
      name,
      icon,
      key,
      component: AboutFile,
      without_load: true,
      footer_visible: true,
      props: { about_file },
    }
  }
  const about_tab = make_tab("A propos", "about", "about", about_search)
  const no_result_tab = make_tab("Résultat", "search", "no_result", no_result)
  const no_recent_search_tab = make_tab(
    "Recherches récentes",
    "search",
    "no_recent_search",
    no_recent_search,
  )

  SearchHistory.on_change("search_page", () => search_input_change())

  function set_tab_key() {
    recent_search_change = !recent_search_change
    tab_key = recent_search_change
  }

  function clear_input() {
    $search_value = ""
    input_element.focus()
    search_input_change()
  }

  function init_search_recent() {
    search_result_data = SearchHistory.get_recent_search()
    const tab_name = "Recherches récentes"
    set_tabs(tab_name)
    is_loading = false
  }

  async function search_input_change() {
    const url_search_value = url_param.get("search")
    if (url_search_value !== $search_value) {
      url_param.set("search", $search_value)
    }
    if ($search_value === "") {
      url_param.delete("search")
      init_search_recent()
      return false
    }
    const value_before = $search_value
    const all_search_raw = await db.search($search_value)
    is_loading = false
    if ($search_value !== value_before) return false
    search_result_data = SearchHistory.put_recent_first(all_search_raw)
    set_tabs()
  }

  function set_tabs(name = "Résultat") {
    set_tab_key()
    if (search_result_data.length === 0) {
      tabs = [is_empty_input ? no_recent_search_tab : no_result_tab]
    } else {
      tabs = [
        {
          name,
          icon: "search",
          key: "search",
          component: SearchResult,
          nb: search_result_data.length,
          props: {
            search_result_data,
            search_value: $search_value,
          },
        },
      ]
    }
    tabs.push(about_tab)
  }

  function focusin() {
    is_focus_in = true
  }

  function focusout() {
    is_focus_in = false
  }

  function window_keydown(e) {
    if (e.key === "/" && !is_focus_in) {
      e.preventDefault()
      input_element.focus()
    }
  }

  $: is_empty_input = ["", undefined, null].includes($search_value)

  const url_search_value = url_param.get("search")
  if (url_search_value !== false && url_search_value !== "") {
    $search_value = url_search_value
  }
  set_tab_key()

  onMount(() => {
    input_element.focus()
    search_input_change()
    $page_content_loaded = true
  })
</script>

<svelte:window on:keydown={window_keydown} />

<Head title="Recherche" description="Page de recherche" />

<section class="section">
  <div>
    <p class="control has-icons-right">
      <button
        class="icon is-small is-left"
        class:active={!is_empty_input && search_result_data.length > 0}
      >
        <i class="fas fa-magnifying-glass" />
      </button>
      <input
        class="search_page_input box_shadow_color shadow_search"
        class:box_shadow={is_focus_in}
        class:is_focus_in
        type="text"
        placeholder="Rechercher..."
        name="search_page_input"
        bind:value={$search_value}
        on:input={debounce(search_input_change, 300)}
        on:focusin={focusin}
        bind:this={input_element}
        autocomplete="off"
        enterkeyhint="search"
        use:clickOutside
        on:click_outside={focusout}
      />
      {#if !is_empty_input}
        <div class="btn_clear_input_wrapper">
          <BtnClearInput click={clear_input} />
        </div>
      {/if}
    </p>
  </div>
  {#if is_loading}
    <Loading />
  {:else}
    {#key tab_key}
      <Tabs {tabs} />
    {/key}
  {/if}
</section>

<style lang="scss">
  @use "../main.scss" as *;

  .section {
    margin-top: 30px;
  }

  .section :global(.search_highlight) {
    background: rgba(255, 255, 0, 0.5);
  }

  p.control {
    margin-bottom: 9px;
    .search_page_input {
      width: 100%;
      margin: auto;
      outline: none;
      background: $background-2;
      padding: 10px 20px;
      padding-left: 3.3rem;
      box-sizing: border-box;
      border-color: $background-3;
      &.is_focus_in {
        border-color: $color-5;
      }
      &::placeholder {
        color: $color-4;
      }
    }
    .btn_clear_input_wrapper {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 40px;
      padding-right: 0.75em;
      margin-right: 10px;
    }
    .icon {
      color: $color-2;
      left: 10px;
      transition: color $transition-basic-1;
      &.active {
        color: color("search");
        text-shadow: 0 0 10px;
      }
    }
  }

  :global(html.rounded_design) {
    .search_page_input {
      border-radius: $rounded;
    }
  }

  :global(html.page_shadow_colored) {
    p.control {
      .search_page_input.is_focus_in {
        border-color: color("search");
      }
    }
  }
</style>
