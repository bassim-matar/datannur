<script lang="ts">
  import { untrack } from 'svelte'
  import { wrapLongText } from '@lib/util'
  import { getParentPath } from '@lib/db'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'
  import escapeHtml from 'escape-html'
  import type { Institution, Column as ColumnType } from '@type'

  let { institutions: institutionsProp }: { institutions: Institution[] } =
    $props()
  const institutions = untrack(() => institutionsProp)

  const isRecursive = true

  let institutionMax = 0
  let folderMax = 0
  let datasetMax = 0
  let nbDocMax = 0
  let variableMax = 0
  let levelMax = 0
  for (const institution of institutions) {
    institution.pathString = getParentPath(institution)
    if (institution.nbChildRecursive ?? 0 > institutionMax) {
      institutionMax = institution.nbChildRecursive ?? 0
    }
    if (institution.nbFolderRecursive ?? 0 > folderMax) {
      folderMax = institution.nbFolderRecursive ?? 0
    }
    if (institution.nbDatasetRecursive ?? 0 > datasetMax) {
      datasetMax = institution.nbDatasetRecursive ?? 0
    }
    if (institution.docsRecursive?.length ?? 0 > nbDocMax) {
      nbDocMax = institution.docsRecursive?.length ?? 0
    }
    if (institution.nbVariableRecursive ?? 0 > variableMax) {
      variableMax = institution.nbVariableRecursive ?? 0
    }
    if ((institution.parents?.length ?? 0) + 1 > levelMax) {
      levelMax = (institution.parents?.length ?? 0) + 1
    }
  }

  const institutionsSorted = [...institutions]
  institutionsSorted.sort((a, b) =>
    (a.pathString ?? '').localeCompare(b.pathString ?? ''),
  )

  const columns: ColumnType[] = [
    Column.favorite(),
    Column.name('institution', 'Institution', {
      withIndent: true,
      linkSameEntityTab: true,
    }),
    Column.description(),
    Column.nbChildRecursive('institution', institutionMax),
    Column.nbFolderRecursive('institution', folderMax),
    Column.nbDatasetRecursive('institution', datasetMax),
    Column.nbVariable('institution', variableMax, {
      recursive: true,
    }),
    Column.nbDoc('institution', nbDocMax),
    Column.tag(),
    Column.parents('institution'),
    {
      data: 'email',
      defaultContent: '',
      title: Render.icon('email') + 'Email',
      tooltip: 'Email de contact',
      render: (data, type) => {
        if (!data) return ''
        if (type !== 'display') return String(data)
        data = escapeHtml(data)
        return wrapLongText(
          `<a href="mailto:${data}" target="_blanck" >${data}</a>`,
        )
      },
    },
    {
      data: 'phone',
      defaultContent: '',
      title: Render.icon('phone') + 'Téléphone',
      tooltip: 'Téléphone de contact',
      render: (data, type) => {
        if (!data) return ''
        if (type !== 'display') return String(data)
        data = escapeHtml(data)
        return `<a href="tel:${data}" target="_blanck" >${data}</a>`
      },
    },
    Column.startDate(),
    Column.endDate(),
    Column.level(levelMax),
  ]
</script>

<Datatable
  entity="institution"
  data={institutionsSorted}
  {isRecursive}
  {columns}
/>
