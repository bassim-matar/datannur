<script lang="ts">
  import { onMount } from 'svelte'
  import db from '@db'
  import { router } from '@lib/router.svelte.js'
  import {
    searchValue,
    headerOpen,
    onPageSearch,
    onPageHomepage,
    isSmallMenu,
  } from '@lib/store'
  import { clickOutside, debounce } from '@lib/util'
  import Logs from '@lib/logs'
  import BtnClearInput from '@layout/BtnClearInput.svelte'
  import SearchHistory from './search-history'
  import SearchBarResult from './SearchBarResult.svelte'

  let isFocusIn = $state(false)
  let inputElement: HTMLInputElement = $state()
  let nbResult = $state(0)
  let allSearch = $state([])
  let dbInitied = $state(false)
  let searchValueDebounced = $state($searchValue)

  let isOpen = $derived(
    isFocusIn && ($searchValue !== '' || nbResult > 0 || !dbInitied),
  )
  let isHiddenByMobileMenu = $derived($isSmallMenu && $headerOpen)

  const maxSearchResult = 100
  let navPosition = 0

  SearchHistory.onChange('search_bar', () => searchInputChange())

  function initSearchRecent() {
    allSearch = SearchHistory.getRecentSearch()
    nbResult = allSearch.length
  }

  async function searchInputChange() {
    if ($onPageSearch) return false
    searchValueDebounced = $searchValue
    navPosition = 0
    if ($searchValue === '') {
      initSearchRecent()
      return false
    }
    let allSearchRaw = await db.search($searchValue)
    if ($searchValue === '') return false
    allSearchRaw = SearchHistory.putRecentFirst(allSearchRaw)
    nbResult = allSearchRaw.length
    allSearch = allSearchRaw.slice(0, maxSearchResult)
  }

  function clearInput() {
    $searchValue = ''
    searchValueDebounced = $searchValue
    selectInput()
    searchInputChange()
  }

  function focusin() {
    isFocusIn = true
  }

  function focusout() {
    isFocusIn = false
  }

  function goToPageSearch() {
    if ($onPageSearch) return false
    router.navigate(`/search?search=${$searchValue}`)
    selectInput()
  }

  function keyup(e) {
    isFocusIn = true
    const code = e.keyCode ? e.keyCode : e.which
    if (code !== 13) return
    if (navPosition === 0) {
      goToPageSearch()
    } else {
      applyToAllSearch((item, itemNum, entity) => {
        if (itemNum === navPosition) {
          router.navigate(`/${entity}/${item.id}`)
          SearchHistory.add(entity, item.id)
          isFocusIn = false
          Logs.add('search_bar', { entity, entity_id: item.id })
        }
      })
    }
  }

  function keydown(e) {
    const code = e.keyCode ? e.keyCode : e.which
    if (code === 40) {
      updateNavPosition(1)
    } else if (code === 38) {
      updateNavPosition(-1)
    }
    if (code === 38 || code === 40) {
      isFocusIn = true
      e.preventDefault()
      return false
    }
  }

  function applyToAllSearch(callback) {
    let itemNum = 0
    for (const item of allSearch) {
      itemNum += 1
      callback(item, itemNum, item.entity)
    }
  }

  function updateNavPosition(move) {
    navPosition += move
    if (navPosition < 0) navPosition = 0
    if (navPosition > nbResult) navPosition = nbResult
    if (navPosition > maxSearchResult) navPosition = maxSearchResult
    applyToAllSearch((item, itemNum) => {
      item.nav_hover = itemNum === navPosition
    })
  }

  function onClick() {
    isFocusIn = true
  }

  function selectInput() {
    inputElement.focus()
    isFocusIn = true
  }

  function windowKeydown(e) {
    const focusedElement = window.document.activeElement
    const isInputFocused =
      focusedElement.tagName === 'INPUT' ||
      focusedElement.tagName === 'TEXTAREA' ||
      focusedElement.tagName === 'SELECT'
    if (e.key === '/' && !isFocusIn && !isInputFocused && !$onPageSearch) {
      e.preventDefault()
      selectInput()
    }
  }

  onMount(() => {
    if ($onPageSearch) selectInput()
  })

  db.loaded.then(() => {
    initSearchRecent()
    dbInitied = true
  })

  SearchHistory.onClear(() => {
    initSearchRecent()
  })
</script>

<svelte:window onkeydown={windowKeydown} />

<div
  class="navbar-item header_search_item"
  class:hidden_by_mobile_menu={isHiddenByMobileMenu}
  use:clickOutside={focusout}
>
  <div
    class="search_bar_container box_shadow_color shadow_search"
    class:box_shadow={isFocusIn}
    class:focus={isFocusIn}
    class:homepage={$onPageHomepage}
    class:page_search={$onPageSearch}
  >
    <p class="control has-icons-right">
      <button
        class="icon is-small is-left"
        class:active={$searchValue !== '' &&
          $searchValue !== undefined &&
          isFocusIn &&
          nbResult > 0}
        onclick={goToPageSearch}
        aria-label="Rechercher"
      >
        <i class="fas fa-magnifying-glass"></i>
      </button>
      <input
        id="header_search_input"
        class="input"
        type="text"
        placeholder="Rechercher..."
        bind:value={$searchValue}
        oninput={debounce(searchInputChange, 200)}
        onkeyup={keyup}
        onkeydown={keydown}
        onfocusin={focusin}
        onclick={onClick}
        bind:this={inputElement}
        autocomplete="off"
        enterkeyhint="search"
      />
      {#if $searchValue !== ''}
        <span class="btn_clear_input_wrapper">
          <BtnClearInput click={clearInput} />
        </span>
      {/if}
    </p>

    {#if !$onPageSearch}
      <SearchBarResult
        {isOpen}
        {nbResult}
        {allSearch}
        searchValue={searchValueDebounced}
        {selectInput}
        bind:isFocusIn
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
