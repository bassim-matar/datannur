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
    if (doc.nbInstitution > institutionMax) institutionMax = doc.nbInstitution
    if (doc.nbFolder > folderMax) folderMax = doc.nbFolder
    if (doc.nbDataset > datasetMax) datasetMax = doc.nbDataset
    if (doc.nbTag > tagMax) tagMax = doc.nbTag
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
      name: 'docType',
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
      data: 'nbInstitution',
      title:
        Render.icon('institution') +
        "<span class='hidden'>nbInstitutions</span>",
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
      data: 'nbFolder',
      title: Render.icon('folder') + "<span class='hidden'>nbFolders</span>",
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
      data: 'nbTag',
      title: Render.icon('tag') + "<span class='hidden'>nbTags</span>",
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
      data: 'nbDataset',
      title: Render.icon('dataset') + "<span class='hidden'>nbDatasets</span>",
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
