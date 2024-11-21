<script>
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { values } = $props()

  const has = {}
  for (const value of values) {
    if (value.description) {
      has.description = true
      break
    }
  }

  const columns = [Column.value()]
  if (has.description) columns.push(Column.description())
</script>

{#if values.length > 0}
  <Datatable entity="value" data={values} {columns} keep_all_cols={true} />
{/if}
