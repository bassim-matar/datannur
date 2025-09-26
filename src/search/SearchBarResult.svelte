<script lang="ts">
  import db from '@db'
  import { onPageHomepage } from '@lib/store'
  import { debounce } from '@lib/util'
  import SearchBarResultRow from './SearchBarResultRow.svelte'

  let {
    isOpen,
    nbResult,
    allSearch,
    searchValue,
    isFocusIn = $bindable(),
    selectInput,
  } = $props()

  let tableWrapper: HTMLDivElement = $state()
  let height = $state(0)
  let hasScrollBar = $state(false)
  let dbLoaded = $state(false)

  const plural = $derived(nbResult > 1 ? 's' : '')

  function updateHeight() {
    if (!tableWrapper) return
    const realHeight = tableWrapper.offsetHeight + 20
    const percentHeight = $onPageHomepage ? 0.8 : 0.9
    const windowHeight = window.innerHeight * percentHeight
    hasScrollBar = realHeight > windowHeight
    height = Math.min(realHeight, windowHeight)
  }

  const debouncedUpdateHeight = debounce(updateHeight, 150)

  $effect(() => {
    void searchValue
    if (nbResult !== undefined) {
      debouncedUpdateHeight()
      setTimeout(() => debouncedUpdateHeight(), 500)
    }
  })

  $effect(() => {
    if ($onPageHomepage !== undefined) debouncedUpdateHeight()
  })

  $effect(() => {
    const handleResize = () => tableWrapper && debouncedUpdateHeight()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })

  db.loaded.then(() => (dbLoaded = true))
</script>

<div id="search_bar_result_outer">
  <div
    id="search_bar_result_wrapper"
    class:is-open={isOpen}
    class:has-scroll-bar={hasScrollBar}
    style="--height: {height}px"
  >
    <div class="table_wrapper" bind:this={tableWrapper}>
      {#if dbLoaded}
        <table class="table is-striped">
          <tbody>
            {#if searchValue === '' && nbResult > 0}
              <tr>
                <td colspan="3">
                  <div class="nb_result">
                    {nbResult} recherche{plural} récente{plural}
                  </div>
                </td>
              </tr>
            {/if}

            {#if searchValue !== ''}
              <tr>
                <td colspan="3">
                  <div class="nb_result">
                    {nbResult} résultat{plural}
                  </div>
                </td>
              </tr>
            {/if}
            {#each allSearch as item (`${item.entity}/${item.id}`)}
              <SearchBarResultRow
                {item}
                {searchValue}
                {selectInput}
                bind:isFocusIn
              />
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @use 'main.scss' as *;

  #search_bar_result_outer {
    position: relative;
    overflow: hidden;
  }

  #search_bar_result_wrapper {
    height: 0px;
    overflow-y: hidden;
    transition: height $transition-basic-1;
    @include scrollbar_light();
    &.is-open {
      height: var(--height);
    }
    &.has-scroll-bar {
      overflow-y: auto;
    }
    .table {
      margin: 10px;
      width: calc(100% - 20px);
      background: transparent;
      td {
        border: 0;
      }
    }
  }

  .nb_result {
    width: 100%;
    font-size: 14px;
  }
</style>
