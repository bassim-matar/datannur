<script lang="ts">
  import Column from '@lib/column'
  import Render from '@lib/render'
  import { link, getPercent } from '@lib/util'
  import Datatable from '@datatable/Datatable.svelte'

  let { docs } = $props()

  let institutionMax = 0
  let folderMax = 0
  let datasetMax = 0
  let tagMax = 0

  for (const doc of docs) {
    if (doc.nb_institution > institutionMax) institutionMax = doc.nb_institution
    if (doc.nb_folder > folderMax) folderMax = doc.nb_folder
    if (doc.nb_dataset > datasetMax) datasetMax = doc.nb_dataset
    if (doc.nb_tag > tagMax) tagMax = doc.nb_tag
  }

  const docsSorted = [...docs]

  function sortDocs(toSort) {
    if (toSort.length === 0) return
    toSort.sort(
      (a, b) =>
        b.inherited?.localeCompare(a.inherited) || a.name.localeCompare(b.name),
    )
  }
  sortDocs(docsSorted)

  let columns = [
    Column.favorite(),
    Column.name('doc', 'Doc'),
    Column.description(),
    {
      data: 'type',
      name: 'doc_type',
      title: Render.icon('type') + 'Type',
      defaultContent: '',
      filterType: 'select',
      tooltip: 'Type de fichier (markdown ou pdf)',
      render: (data, type) => {
        if (!data) return ''
        if (['filter', 'sort', 'export'].includes(type)) return data
        return `${data} ${Render.icon(data)}`
      },
    },
    Column.docPath(),
    Column.timestamp({
      varName: 'last_update',
      title: 'Mise à jour',
      tooltip: 'Date de dernière mise à jour',
    }),
    Column.inherited(),
    {
      data: 'nb_institution',
      title:
        Render.icon('institution') +
        "<span class='hidden'>nb_institutions</span>",
      filterType: 'input',
      tooltip: "Nombre d'institutions",
      render: (data, type, row) => {
        if (!data) return ''
        const content = link('doc/' + row.id + '?tab=institutions', data)
        const percent = getPercent(data / institutionMax)
        return `${Render.numPercent(content, percent, 'institution', type)}`
      },
    },
    {
      data: 'nb_folder',
      title: Render.icon('folder') + "<span class='hidden'>nb_folder</span>",
      filterType: 'input',
      tooltip: 'Nombre de dossiers',
      render: (data, type, row) => {
        if (!data) return ''
        const content = link('doc/' + row.id + '?tab=folders', data)
        const percent = getPercent(data / folderMax)
        return `${Render.numPercent(content, percent, 'folder', type)}`
      },
    },
    {
      data: 'nb_tag',
      title: Render.icon('tag') + "<span class='hidden'>nb_tag</span>",
      filterType: 'input',
      tooltip: 'Nombre de mots clés',
      render: (data, type, row) => {
        if (!data) return ''
        const content = link('doc/' + row.id + '?tab=tags', data)
        const percent = getPercent(data / tagMax)
        return `${Render.numPercent(content, percent, 'tag', type)}`
      },
    },
    {
      data: 'nb_dataset',
      title: Render.icon('dataset') + "<span class='hidden'>nb_dataset</span>",
      filterType: 'input',
      tooltip: 'Nombre de datasets',
      render: (data, type, row) => {
        if (!data) return ''
        const content = link('doc/' + row.id + '?tab=datasets', data)
        const percent = getPercent(data / datasetMax)
        return `${Render.numPercent(content, percent, 'dataset', type)}`
      },
    },
  ]
</script>

<Datatable entity="doc" data={docsSorted} {columns} />
