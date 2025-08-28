<script>
  import { get_local_filter } from "@js/db"
  import Main_filter from "@js/Main_filter"
  import Switch from "@layout/Switch.svelte"
  import Button from "@layout/Button.svelte"

  let filters = $state([])

  const saved_filters = Main_filter.get()
  const db_filters = get_local_filter()

  for (const db_filter of db_filters) {
    const filter = db_filter
    filter.is_active = true
    filters.push(filter)
    for (const saved_filter of saved_filters) {
      if (saved_filter.id === filter.id) {
        filter.is_active = saved_filter.is_active
        break
      }
    }
  }

  function update_filter_state() {
    Main_filter.save(filters)
  }
</script>

{#each filters as filter}
  <div class="navbar-item">
    <Switch bind:value={filter.is_active} change={update_filter_state}>
      {filter.name}
    </Switch>
  </div>
{/each}

<div class="navbar-item">
  <Button onclick={() => window.location.reload()}>Appliquer</Button>
</div>

<style lang="scss">
  @use "../main.scss" as *;

  .navbar-item {
    :global(.switch[type="checkbox"] + label) {
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
