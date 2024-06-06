<script>
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  export let values
  export let nb_item
  export let load_first = false

  const has = {}
  for (const value of values) {
    if (value.description) has.description = true
  }

  const columns = [Column.value()]
  if (has.description) columns.push(Column.description())
</script>

{#if values.length > 0}
  <Datatable entity="value" data={values} {columns} {load_first} bind:nb_item keep_all_cols={true} />
{/if}
