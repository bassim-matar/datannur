<script lang="ts">
  import FilterInput from './FilterInput.svelte'

  let {
    columns,
    table_id = '',
    loading = true,
    nb_sticky = 1,
    datatable_update_draw = 0,
  } = $props()

  let loaded = $state(false)
  const filters_left = $state({ 0: 0 })

  function getWidthElemNum(num) {
    const selector = `.header_filter_wrapper .th_${table_id}_${num}`
    return document.querySelector(selector)?.getBoundingClientRect().width
  }

  function updateStickyWidth() {
    for (let i = 0; i < nb_sticky; i++) {
      filters_left[i + 1] = filters_left[i] + getWidthElemNum(i)
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
    if (datatable_update_draw) {
      updateStickyWidth()
    }
  })
</script>

<tr class="header_filter_wrapper">
  {#each columns as column, i (`${column.data}/${column.title}`)}
    {#if i < nb_sticky}
      <th
        class="header_filter_th th_{table_id}_{i} sticky"
        class:dtfc-fixed-left={i + 1 === nb_sticky}
        style={`left: ${filters_left[i]}px`}
      >
        <FilterInput {table_id} {i} {column} />
      </th>
    {:else}
      <th class="header_filter_th">
        <FilterInput {table_id} {i} {column} />
      </th>
    {/if}
  {/each}
</tr>

<style lang="scss">
  @use 'main.scss' as *;

  .header_filter_wrapper {
    .header_filter_th {
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
