<script lang="ts">
  import { wrapLongText, link } from '@lib/util'
  import Datatable from '@datatable/Datatable.svelte'
  import Render from '@lib/render'
  import Column from '@lib/column'
  import { entityNames } from '@lib/constant'
  import escapeHTML from 'escape-html'

  let { logs } = $props()

  for (const log of logs) {
    log._entityClean = log.entity ? entityNames[log.entity] : ''
    log._entity = log.entity
  }

  let columns = [
    {
      data: 'action',
      title: Render.icon('log') + 'Log',
      defaultContent: '',
      filterType: 'select',
      tooltip: 'Action',
      render: (data, type, row) => {
        if (type !== 'display') return row.actionReadable || row.action
        let content = ''
        if (row.actionIcon) content += Render.icon(row.actionIcon)
        if (row.actionReadable) content += ' ' + escapeHTML(row.actionReadable)
        else content += ' ' + escapeHTML(row.action)
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
        if (!data) return ''
        if (type !== 'display') return data
        data = escapeHTML(data)
        let content = ''
        if (row.elementIcon) content += Render.icon(escapeHTML(row.elementIcon))
        if (row.elementLink) {
          content += link(row.elementLink, data)
        } else {
          content += ' ' + data
        }
        return wrapLongText(content)
      },
    },
    Column.timestamp(),
  ]
</script>

<Datatable entity="log" data={logs} {columns} />
