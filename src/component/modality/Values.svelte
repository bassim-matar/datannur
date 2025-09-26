<script lang="ts">
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'

  let { values } = $props()

  const hasDescription = values.some(value => value.description)
  const columns = [Column.value()]
  if (hasDescription) columns.push(Column.description())
</script>

<Datatable
  entity="value"
  data={values}
  {columns}
  keepAllCols={true}
  sortByName={true}
/>
