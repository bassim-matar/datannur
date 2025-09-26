<script lang="ts">
  import { getLocalFilter } from '@lib/db'
  import MainFilter from '@lib/main-filter'
  import Switch from '@layout/Switch.svelte'
  import Button from '@layout/Button.svelte'

  let filters = $state([])

  const savedFilters = MainFilter.get()
  const dbFilters = getLocalFilter()

  for (const dbFilter of dbFilters) {
    const filter = dbFilter
    filter.is_active = true
    filters.push(filter)
    for (const savedFilter of savedFilters) {
      if (savedFilter.id === filter.id) {
        filter.is_active = savedFilter.is_active
        break
      }
    }
  }

  function updateFilterState() {
    MainFilter.save(filters)
  }
</script>

{#each filters as filter (filter.id)}
  <div class="navbar-item">
    <Switch bind:value={filter.is_active} change={updateFilterState}>
      {filter.name}
    </Switch>
  </div>
{/each}

<div class="navbar-item">
  <Button onclick={() => window.location.reload()}>Appliquer</Button>
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .navbar-item {
    :global(.switch[type='checkbox'] + label) {
      font-size: 0.875rem;
      color: $color-2;
    }
    :global(.button) {
      font-size: 0.875rem;
      color: $color-2;
      margin: auto;
    }
  }
</style>
