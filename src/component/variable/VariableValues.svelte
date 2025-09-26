<script lang="ts">
  import Render from '@lib/render'
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'
  import { link } from '@lib/util'

  let { variableValues, isMeta = false } = $props()

  let hasDescription = false
  for (const value of variableValues) {
    if (value.description) {
      hasDescription = true
      break
    }
  }

  function defineColumns() {
    const columns = []
    if (!isMeta) {
      columns.push({
        data: 'modalityName',
        title: Render.icon('modality') + 'modalité',
        tooltip: 'Modalité',
        render: (data, type, row) =>
          link('modality/' + row.modality_id, data, 'modality'),
      })
    }
    columns.push(Column.value())
    if (hasDescription) columns.push(Column.description())
    return columns
  }
  const columns = defineColumns()
</script>

<Datatable
  entity="value"
  data={variableValues}
  {columns}
  keepAllCols={true}
  sortByName={true}
/>
