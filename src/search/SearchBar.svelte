<script>
  import { onMount } from "svelte"
  import db from "@db"
  import { router } from "@js/router.svelte.js"
  import { search_value, page_name } from "@js/store"
  import { clickOutside, debounce, is_mobile } from "@js/util"
  import Logs from "@js/Logs"
  import BtnClearInput from "@layout/BtnClearInput.svelte"
  import SearchHistory from "./SearchHistory"
  import SearchBarResult from "./SearchBarResult.svelte"

  let { close_menu } = $props()

  let is_focus_in = $state(false)
  let input_element = $state()
  let nb_result = $state("")
  let all_search = $state([])
  let db_initied = $state(false)
  let search_value_debounced = $state($search_value)

  let on_page_search = $derived($page_name === "search")
  let on_page_homepage = $derived($page_name === "homepage")
  let is_open = $derived(
    is_focus_in && ($search_value !== "" || nb_result > 0 || !db_initied),
  )

  const max_search_result = 100
  let nav_position = 0

  SearchHistory.on_change("search_bar", () => search_input_change())

  function init_search_recent() {
    all_search = SearchHistory.get_recent_search()
    nb_result = all_search.length
  }

  async function search_input_change() {
    search_value_debounced = $search_value
    nav_position = 0
    if ($search_value === "") {
      init_search_recent()
      return false
    }
    let all_search_raw = await db.search($search_value)
    if ($search_value === "") return false
    all_search_raw = SearchHistory.put_recent_first(all_search_raw)
    nb_result = all_search_raw.length
    all_search = all_search_raw.slice(0, max_search_result)
  }

  function clear_input() {
    $search_value = ""
    search_value_debounced = $search_value
    select_input()
    search_input_change()
  }

  function focusin() {
    is_focus_in = true
  }

  function focusout() {
    is_focus_in = false
  }

  function go_to_page_search() {
    router.navigate(`/search?search=${$search_value}`)
    is_focus_in = false
    close_menu()
  }

  function keyup(e) {
    is_focus_in = true
    const code = e.keyCode ? e.keyCode : e.which
    if (code !== 13) return
    if (nav_position === 0) {
      go_to_page_search()
    } else {
      apply_to_all_search((item, item_num, entity) => {
        if (item_num === nav_position) {
          $search_value = ""
          search_value_debounced = $search_value
          router.navigate(`/${entity}/${item.id}`)
          SearchHistory.add(entity, item.id)
          is_focus_in = false
          Logs.add("search_bar", { entity, entity_id: item.id })
        }
      })
    }
  }

  function keydown(e) {
    const code = e.keyCode ? e.keyCode : e.which
    if (code === 40) {
      update_nav_position(1)
    } else if (code === 38) {
      update_nav_position(-1)
    }
    if (code === 38 || code === 40) {
      is_focus_in = true
      e.preventDefault()
      return false
    }
  }

  function apply_to_all_search(callback) {
    let item_num = 0
    for (const item of all_search) {
      item_num += 1
      callback(item, item_num, item.entity)
    }
  }

  function update_nav_position(move) {
    nav_position += move
    if (nav_position < 0) nav_position = 0
    if (nav_position > nb_result) nav_position = nb_result
    if (nav_position > max_search_result) nav_position = max_search_result
    apply_to_all_search((item, item_num) => {
      item.nav_hover = item_num === nav_position
    })
  }

  function on_click() {
    is_focus_in = true
  }

  function select_input() {
    input_element.focus()
    is_focus_in = true
  }

  function window_keydown(e) {
    const focused_element = window.document.activeElement
    const is_input_focused =
      focused_element.tagName === "INPUT" ||
      focused_element.tagName === "TEXTAREA" ||
      focused_element.tagName === "SELECT"
    if (e.key === "/" && !is_focus_in && !is_input_focused && !on_page_search) {
      e.preventDefault()
      select_input()
    }
  }

  onMount(() => {
    if (on_page_homepage && !is_mobile) select_input()
  })

  db.loaded.then(() => {
    init_search_recent()
    db_initied = true
  })

  SearchHistory.on_clear(() => {
    init_search_recent()
  })
</script>

<svelte:window onkeydown={window_keydown} />

<div
  class="navbar-item header_search_item"
  use:clickOutside
  onclick_outside={focusout}
>
  <div
    class="search_bar_container box_shadow_color shadow_search"
    class:box_shadow={is_focus_in}
    class:focus={is_focus_in}
    class:homepage={on_page_homepage}
  >
    <p class="control has-icons-right">
      <button
        class="icon is-small is-left"
        class:active={$search_value !== "" &&
          $search_value !== undefined &&
          is_focus_in &&
          nb_result > 0}
        onclick={go_to_page_search}
        aria-label="Rechercher"
      >
        <i class="fas fa-magnifying-glass"></i>
      </button>
      <input
        id="header_search_input"
        class="input"
        type="text"
        placeholder="Rechercher..."
        bind:value={$search_value}
        oninput={debounce(search_input_change, 200)}
        onkeyup={keyup}
        onkeydown={keydown}
        onfocusin={focusin}
        onclick={on_click}
        bind:this={input_element}
        class:is_open
        autocomplete="off"
        enterkeyhint="search"
      />
      {#if $search_value !== ""}
        <span class="btn_clear_input_wrapper">
          <BtnClearInput click={clear_input} />
        </span>
      {/if}
    </p>

    <SearchBarResult
      {is_open}
      {nb_result}
      {all_search}
      search_value={search_value_debounced}
      {select_input}
      bind:is_focus_in
    />
  </div>
</div>

<style lang="scss">
  @use "../main.scss" as *;

  .header_search_item {
    padding: 0;
    margin-right: 0px;
    position: initial;

    .search_bar_container {
      position: absolute;
      top: 2.5px;
      right: 3em;
      margin-right: 0px;
      overflow: hidden;
      background: $background-2;
      border: 1px solid;
      border-color: $background-3;
      transition:
        border-color $transition-basic-1,
        box-shadow $transition-basic-1;
      &.focus {
        border-color: $color-5;
      }
      &.homepage {
        top: 65px;
      }
    }

    #header_search_input {
      position: relative;
      width: calc(100vw - 730px);
      max-width: 500px;
      margin: 0;
      padding-left: 3.3rem;
      background: transparent;
      border: none;
      box-shadow: none;
      &::placeholder {
        color: $color-4;
      }
    }
    .search_bar_container.homepage #header_search_input {
      width: calc(100vw - 98px);
      max-width: none;
      padding: 10px 20px;
      padding-left: 3.3rem;
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
      pointer-events: all;
      left: 10px;
      cursor: pointer;
      transition: color $transition-basic-1;
      &:hover {
        color: color("search");
      }
      &.active {
        color: color("search");
        text-shadow: 0 0 10px;
      }
    }
  }

  :global(html.rounded_design) {
    .search_bar_container {
      border-radius: $rounded;
    }
  }

  :global(html.page_shadow_colored) {
    .header_search_item {
      .search_bar_container.focus {
        border-color: color("search");
      }
    }
  }
</style>
