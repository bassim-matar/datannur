<script>
  import db from "@db"
  import SearchBarResultRow from "./SearchBarResultRow.svelte"

  let {
    is_open,
    nb_result,
    all_search,
    search_value,
    is_focus_in = $bindable(),
    select_input,
  } = $props()

  let table_wrapper = $state()
  let height = $state(0)
  let has_scroll_bar = $state(false)

  const plural = $derived(nb_result > 1 ? "s" : "")

  $effect(() => {
    if (nb_result !== "") {
      setTimeout(() => {
        const real_height = table_wrapper.offsetHeight + 20
        const window_height = window.innerHeight * 0.9
        has_scroll_bar = real_height > window_height
        height = Math.min(real_height, window_height)
      }, 1)
    }
  })
</script>

<div id="search_bar_result_outer">
  <div
    id="search_bar_result_wrapper"
    class:is_open
    class:has_scroll_bar
    style="--height: {height}px"
  >
    <div class="table_wrapper" bind:this={table_wrapper}>
      {#await db.loaded}
        <!-- Loading -->
      {:then}
        <table class="table is-striped">
          <tbody>
            {#if search_value === "" && nb_result > 0}
              <tr>
                <td colspan="3">
                  <div style="width: 100%;">
                    {nb_result} recherche{plural} récente{plural}
                  </div>
                </td>
              </tr>
            {/if}

            {#if search_value !== ""}
              <tr>
                <td colspan="3">
                  <div style="width: 100%;">
                    {nb_result} résultat{plural}
                  </div>
                </td>
              </tr>
            {/if}
            {#each all_search as item}
              <SearchBarResultRow
                {item}
                {search_value}
                {select_input}
                bind:is_focus_in
              />
            {/each}
          </tbody>
        </table>
      {/await}
    </div>
  </div>
</div>

<style lang="scss">
  @use "../main.scss" as *;

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

  @media screen and (max-width: 1023px) {
    #search_bar_result_outer {
      display: none;
    }
  }
</style>
