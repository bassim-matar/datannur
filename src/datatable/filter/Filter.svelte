<script lang="ts">
  import FilterInput from './FilterInput.svelte'

  let {
    columns,
    tableId = '',
    loading = true,
    nbSticky = 1,
    datatableUpdateDraw = 0,
  } = $props()

  let loaded = $state(false)
  const filtersLeft = $state([0])

  function getWidthElemNum(num) {
    const selector = `.header-filter-wrapper .th-${tableId}-${num}`
    const elem = document.querySelector(selector)
    return elem ? elem.getBoundingClientRect().width : 0
  }

  function updateStickyWidth() {
    for (let i = 0; i < nbSticky; i++) {
      filtersLeft[i + 1] = filtersLeft[i] + getWidthElemNum(i)
    }
  }

  $effect(() => {
    if (!loading && !loaded) {
      loaded = true
      setTimeout(() => {
        updateStickyWidth()
      }, 100)
      setTimeout(() => {
        updateStickyWidth()
      }, 1000)
    }
  })

  $effect(() => {
    if (datatableUpdateDraw) {
      updateStickyWidth()
    }
  })
</script>

<tr class="header-filter-wrapper">
  {#each columns as column, i (`${column.data}/${column.title}`)}
    {#if i < nbSticky}
      <th
        class="header-filter-th th-{tableId}-{i} sticky"
        class:dtfc-fixed-left={i + 1 === nbSticky}
        style={`left: ${filtersLeft[i]}px`}
      >
        <FilterInput {tableId} {i} {column} />
      </th>
    {:else}
      <th class="header-filter-th">
        <FilterInput {tableId} {i} {column} />
      </th>
    {/if}
  {/each}
</tr>

<style lang="scss">
  @use 'main.scss' as *;

  .header-filter-wrapper {
    .header-filter-th {
      padding: 0;
      margin: 0;
      border-bottom: 0;
      background: $background-2;
      &.sticky {
        left: 0;
        background: $background-2;
        z-index: 2;
        position: sticky;
      }
    }
  }
</style>
