<script lang="ts">
  import { onMount } from 'svelte'
  import db from '@db'
  import { router } from '@lib/router.svelte.js'
  import {
    search_value,
    header_open,
    on_page_search,
    on_page_homepage,
    is_small_menu,
    page,
  } from '@lib/store'
  import { clickOutside, debounce } from '@lib/util'
  import Logs from '@lib/logs'
  import BtnClearInput from '@layout/BtnClearInput.svelte'
  import SearchHistory from './search-history'
  import SearchBarResult from './SearchBarResult.svelte'

  let is_focus_in = $state(false)
  let input_element: HTMLInputElement = $state()
  let nb_result = $state(0)
  let all_search = $state([])
  let db_initied = $state(false)
  let search_value_debounced = $state($search_value)

  let is_open = $derived(
    is_focus_in && ($search_value !== '' || nb_result > 0 || !db_initied),
  )
  let is_hidden_by_mobile_menu = $derived($is_small_menu && $header_open)

  const max_search_result = 100
  let nav_position = 0

  SearchHistory.onChange('search_bar', () => search_input_change())

  function init_search_recent() {
    all_search = SearchHistory.getRecentSearch()
    nb_result = all_search.length
  }

  async function search_input_change() {
    if ($on_page_search) return false
    search_value_debounced = $search_value
    nav_position = 0
    if ($search_value === '') {
      init_search_recent()
      return false
    }
    let all_search_raw = await db.search($search_value)
    if ($search_value === '') return false
    all_search_raw = SearchHistory.putRecentFirst(all_search_raw)
    nb_result = all_search_raw.length
    all_search = all_search_raw.slice(0, max_search_result)
  }

  function clear_input() {
    $search_value = ''
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
    if ($on_page_search) return false
    router.navigate(`/search?search=${$search_value}`)
    select_input()
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
          router.navigate(`/${entity}/${item.id}`)
          SearchHistory.add(entity, item.id)
          is_focus_in = false
          Logs.add('search_bar', { entity, entity_id: item.id })
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
      focused_element.tagName === 'INPUT' ||
      focused_element.tagName === 'TEXTAREA' ||
      focused_element.tagName === 'SELECT'
    if (
      e.key === '/' &&
      !is_focus_in &&
      !is_input_focused &&
      !$on_page_search
    ) {
      e.preventDefault()
      select_input()
    }
  }

  onMount(() => {
    if ($on_page_search) select_input()
  })

  db.loaded.then(() => {
    init_search_recent()
    db_initied = true
  })

  SearchHistory.onClear(() => {
    init_search_recent()
  })
</script>

<svelte:window onkeydown={window_keydown} />

<div
  class="navbar-item header_search_item"
  class:hidden_by_mobile_menu={is_hidden_by_mobile_menu}
  use:clickOutside={focusout}
>
  <div
    class="search_bar_container box_shadow_color shadow_search"
    class:box_shadow={is_focus_in}
    class:focus={is_focus_in}
    class:homepage={$on_page_homepage}
    class:page_search={$on_page_search}
  >
    <p class="control has-icons-right">
      <button
        class="icon is-small is-left"
        class:active={$search_value !== '' &&
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
      {#if $search_value !== ''}
        <span class="btn_clear_input_wrapper">
          <BtnClearInput click={clear_input} />
        </span>
      {/if}
    </p>

    {#if !$on_page_search}
      <SearchBarResult
        {is_open}
        {nb_result}
        {all_search}
        search_value={search_value_debounced}
        {select_input}
        bind:is_focus_in
      />
    {/if}
  </div>
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .header_search_item {
    padding: 0;
    margin-right: 0px;
    position: initial;

    .search_bar_container {
      position: fixed;
      z-index: 40;
      top: 2.5px;
      left: 680px;
      right: 3em;
      margin-right: 0px;
      overflow: hidden;
      background: $background-2;
      border: 1px solid;
      border-color: $background-3;
      transition:
        border-color $transition-basic-1,
        box-shadow $transition-basic-1,
        top $transition-basic-1,
        left $transition-basic-1;
      &.focus {
        border-color: $color-5;
      }
      &.homepage,
      &.page_search {
        top: 65px;
        left: 3em;
        z-index: 20;
        transition:
          border-color $transition-basic-1,
          box-shadow $transition-basic-1,
          top $transition-basic-1,
          left $transition-basic-1,
          z-index 0s $transition-basic-1;
      }
    }

    #header_search_input {
      position: relative;
      width: calc(100vw - 730px);
      margin: 0;
      padding-left: 3.3rem;
      background: transparent;
      border: none;
      box-shadow: none;
      transition: $transition-basic-1;
      &::placeholder {
        color: $color-4;
      }
    }
    .search_bar_container.homepage #header_search_input,
    .search_bar_container.page_search #header_search_input {
      width: 100%;
      max-width: 100%;
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
      margin-right: 2px;
    }
    .icon {
      color: $color-2;
      pointer-events: all;
      left: 10px;
      cursor: pointer;
      transition: color $transition-basic-1;
      &:hover {
        color: color('search');
      }
      &.active {
        color: color('search');
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
        border-color: color('search');
      }
    }
  }

  @media screen and (max-width: 1023px) {
    .header_search_item .search_bar_container.homepage {
      left: 50px;
    }
  }

  @media screen and (max-width: 600px) {
    .header_search_item .search_bar_container.homepage,
    .header_search_item .search_bar_container.page_search {
      left: 0px;
      right: 0px;
      top: 80px;
      max-width: 100vw;
    }
  }

  .header_search_item.hidden_by_mobile_menu {
    opacity: 0;
    pointer-events: none;
    transition: opacity $transition-basic-1;
  }
</style>
