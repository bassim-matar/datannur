<script lang="ts">
  import { wrapLongText, link } from '@lib/util'
  import Datatable from '@datatable/Datatable.svelte'
  import Render from '@lib/render'
  import Column from '@lib/column'
  import { entityNames } from '@lib/constant'

  let { logs } = $props()

  for (const log of logs) {
    log._entityClean = log.entity ? entityNames[log.entity] : ''
    log._entity = log.entity
  }

  let columns = [
    {
      data: 'action',
      title: Render.icon('log') + 'Log',
      tooltip: 'Action',
      render: (data, type, row) => {
        let content = ''
        if (row.actionIcon) content += Render.icon(row.actionIcon)
        if (row.actionReadable) content += ' ' + row.actionReadable
        else content += ' ' + row.action
        return wrapLongText(data ? content : '')
      },
    },
    Column.entity(),
    {
      data: 'element',
      title: Render.icon('entity') + 'Element',
      defaultContent: '',
      tooltip: 'Element impliqué',
      render: (data, type, row) => {
        let content = ''
        if (row.elementIcon) content += Render.icon(row.elementIcon)
        if (row.elementLink) {
          content += link(row.elementLink, row.element)
        } else {
          content += ' ' + row.element
        }
        return wrapLongText(data ? content : '')
      },
    },
    Column.timestamp(),
  ]
</script>

<Datatable entity="log" data={logs} {columns} />
