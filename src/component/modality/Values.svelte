<script lang="ts">
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { values } = $props()

  const has_description = values.some(value => value.description)
  const columns = [Column.value()]
  if (has_description) columns.push(Column.description())
</script>

<Datatable
  entity="value"
  data={values}
  {columns}
  keep_all_cols={true}
  sort_by_name={true}
/>
