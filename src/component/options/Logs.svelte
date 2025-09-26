<script lang="ts">
  import { wrapLongText } from '@lib/util'
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
      render: data => {
        return wrapLongText(data ? data : '')
      },
    },
    Column.entity(),
    {
      data: 'element',
      title: Render.icon('entity') + 'Element',
      defaultContent: '',
      tooltip: 'Element impliqué',
      render: data => wrapLongText(data ? data : ''),
    },
    Column.timestamp(),
  ]
</script>

<Datatable entity="log" data={logs} {columns} />
