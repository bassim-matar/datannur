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
    institution.path_string = getParentPath(institution)
    if (institution.nb_child_recursive > institutionMax) {
      institutionMax = institution.nb_child_recursive
    }
    if (institution.nb_folder_recursive > folderMax) {
      folderMax = institution.nb_folder_recursive
    }
    if (institution.nb_dataset_recursive > datasetMax) {
      datasetMax = institution.nb_dataset_recursive
    }
    if (institution.docs_recursive.length > nbDocMax) {
      nbDocMax = institution.docs_recursive.length
    }
    if (institution.nb_variable_recursive > variableMax) {
      variableMax = institution.nb_variable_recursive
    }
    if (institution.parents?.length + 1 > levelMax) {
      levelMax = institution.parents?.length + 1
    }
  }

  const institutionsSorted = [...institutions]
  institutionsSorted.sort((a, b) => a.path_string.localeCompare(b.path_string))

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
