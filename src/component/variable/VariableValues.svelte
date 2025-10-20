<script lang="ts">
  import Render from '@lib/render'
  import Column from '@lib/column'
  import Datatable from '@datatable/Datatable.svelte'
  import { link } from 'svelte-fileapp'
  import escapeHtml from 'escape-html'
  import type { Value, Column as ColumnType } from '@type'

  let {
    variableValues,
    isMeta = false,
  }: { variableValues: Value[]; isMeta: boolean } = $props()

  let hasDescription = false
  for (const value of variableValues) {
    if (value.description) {
      hasDescription = true
      break
    }
  }

  function defineColumns() {
    const columns: ColumnType[] = []
    if (!isMeta) {
      columns.push({
        data: 'modalityName',
        title: Render.icon('modality') + 'modalité',
        tooltip: 'Modalité',
        render: (data, type, row: Value) => {
          if (!data) return ''
          if (type !== 'display') return String(data)
          return link(
            'modality/' + row.modalityId,
            escapeHtml(data),
            'modality',
          )
        },
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
