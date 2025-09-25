<script lang="ts">
  import db from '@db'
  import { on_page_homepage } from '@lib/store'
  import { debounce } from '@lib/util'
  import SearchBarResultRow from './SearchBarResultRow.svelte'

  let {
    is_open,
    nb_result,
    all_search,
    search_value,
    is_focus_in = $bindable(),
    selectInput,
  } = $props()

  let table_wrapper: HTMLDivElement = $state()
  let height = $state(0)
  let has_scroll_bar = $state(false)
  let db_loaded = $state(false)

  const plural = $derived(nb_result > 1 ? 's' : '')

  function updateHeight() {
    if (!table_wrapper) return
    const real_height = table_wrapper.offsetHeight + 20
    const percent_height = $on_page_homepage ? 0.8 : 0.9
    const window_height = window.innerHeight * percent_height
    has_scroll_bar = real_height > window_height
    height = Math.min(real_height, window_height)
  }

  const debounced_updateHeight = debounce(updateHeight, 150)

  $effect(() => {
    void search_value
    if (nb_result !== undefined) {
      debounced_updateHeight()
      setTimeout(() => debounced_updateHeight(), 500)
    }
  })

  $effect(() => {
    if ($on_page_homepage !== undefined) debounced_updateHeight()
  })

  $effect(() => {
    const handle_resize = () => table_wrapper && debounced_updateHeight()
    window.addEventListener('resize', handle_resize)
    return () => window.removeEventListener('resize', handle_resize)
  })

  db.loaded.then(() => (db_loaded = true))
</script>

<div id="search_bar_result_outer">
  <div
    id="search_bar_result_wrapper"
    class:is_open
    class:has_scroll_bar
    style="--height: {height}px"
  >
    <div class="table_wrapper" bind:this={table_wrapper}>
      {#if db_loaded}
        <table class="table is-striped">
          <tbody>
            {#if search_value === '' && nb_result > 0}
              <tr>
                <td colspan="3">
                  <div class="nb_result">
                    {nb_result} recherche{plural} récente{plural}
                  </div>
                </td>
              </tr>
            {/if}

            {#if search_value !== ''}
              <tr>
                <td colspan="3">
                  <div class="nb_result">
                    {nb_result} résultat{plural}
                  </div>
                </td>
              </tr>
            {/if}
            {#each all_search as item (`${item.entity}/${item.id}`)}
              <SearchBarResultRow
                {item}
                {search_value}
                {selectInput}
                bind:is_focus_in
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
    &.is_open {
      height: var(--height);
    }
    &.has_scroll_bar {
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
