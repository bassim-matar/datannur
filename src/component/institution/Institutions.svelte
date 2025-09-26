<script lang="ts">
  import { wrapLongText } from '@lib/util'
  import { getParentPath } from '@lib/db'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'

  let { institutions } = $props()

  const isRecursive = true

  let institutionMax = 0
  let folderMax = 0
  let datasetMax = 0
  let nbDocMax = 0
  let variableMax = 0
  let levelMax = 0
  for (const institution of institutions) {
    institution.pathString = getParentPath(institution)
    if (institution.nbChildRecursive > institutionMax) {
      institutionMax = institution.nbChildRecursive
    }
    if (institution.nbFolderRecursive > folderMax) {
      folderMax = institution.nbFolderRecursive
    }
    if (institution.nbDatasetRecursive > datasetMax) {
      datasetMax = institution.nbDatasetRecursive
    }
    if (institution.docsRecursive.length > nbDocMax) {
      nbDocMax = institution.docsRecursive.length
    }
    if (institution.nbVariableRecursive > variableMax) {
      variableMax = institution.nbVariableRecursive
    }
    if (institution.parents?.length + 1 > levelMax) {
      levelMax = institution.parents?.length + 1
    }
  }

  const institutionsSorted = [...institutions]
  institutionsSorted.sort((a, b) => a.pathString.localeCompare(b.pathString))

  const columns = [
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
      render: data => {
        return wrapLongText(
          data ? `<a href="mailto:${data}" target="_blanck" >${data}</a>` : '',
        )
      },
    },
    {
      data: 'phone',
      defaultContent: '',
      title: Render.icon('phone') + 'Téléphone',
      tooltip: 'Téléphone de contact',
      render: data =>
        data ? `<a href="tel:${data}" target="_blanck" >${data}</a>` : '',
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
