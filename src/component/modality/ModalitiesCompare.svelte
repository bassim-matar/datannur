<script lang="ts">
  import db from '@db'
  import { modalitiesSimilitutes, tabSelected } from '@lib/store'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import { link, worker } from '@lib/util'
  import { modalityCompareWorker } from '@lib/modality-compare-worker'
  import Datatable from '@datatable/Datatable.svelte'
  import Loading from '@frame/Loading.svelte'
  import escapeHtml from 'escape-html'
  import type { ModalitySimilitute, Column as ColumnType } from '@type'

  let { modalitiesCompare }: { modalitiesCompare: true } = $props()
  void modalitiesCompare
  let similitutes: ModalitySimilitute[] = $state([])
  let loading = $state(true)

  ;(async () => {
    if ($modalitiesSimilitutes.length > 0) {
      similitutes = $modalitiesSimilitutes
      loading = false
      return
    }
    const modalities = db.getAll('modality')
    similitutes = await worker(
      { modalitiesCompare: modalities, limit: 50000 },
      modalityCompareWorker,
    )
    $modalitiesSimilitutes = similitutes
    loading = false
    if (similitutes.length === 0) $tabSelected.nb = 0
  })()

  const columns: ColumnType[] = [
    {
      data: 'ratio',
      title: Render.icon('compare') + 'Similitude',
      tooltip:
        'Pourcentage de valeur de la modalité 1 présente dans la modalité 2',
      render: data => `${data}%`,
    },
    {
      data: 'modality1Id',
      title: Render.icon('modality') + 'Modalité',
      tooltip: 'Nom de la modalité 1',
      render: (data, type, row: ModalitySimilitute) => {
        if (type !== 'display') return String(row.modality2Name)
        return link(
          'modality/' + data,
          escapeHtml(row.modality1Name),
          'modality',
        )
      },
    },
    Column.folder('modality1FolderId', 'modality1FolderName'),
    {
      data: 'modality1Type',
      title: Render.icon('type') + 'Type',
      tooltip: 'Type de la modalité 1',
      render: Render.shortText,
    },
    {
      data: 'modality1NbValue',
      title: Render.icon('value') + 'Valeurs',
      tooltip: 'Nombre de valeurs de la modalité 1',
      render: Render.num,
    },
    {
      data: 'modality1NbVariable',
      title: Render.icon('variable') + 'Variables',
      tooltip: 'Nombre de variables liées à la modalité 1',
      render: Render.num,
    },
    {
      data: 'modality2Id',
      title: Render.icon('modality') + 'Similaire à',
      tooltip: 'Nom de la modalité 2',
      render: (data, type, row: ModalitySimilitute) => {
        if (type !== 'display') return String(row.modality2Name)
        return link(
          'modality/' + data,
          escapeHtml(row.modality2Name),
          'modality',
        )
      },
    },
    Column.folder('modality2FolderId', 'modality2FolderName'),
    {
      data: 'modality2Type',
      title: Render.icon('type') + 'Type',
      tooltip: 'Type de la modalité 2',
      render: Render.shortText,
    },
    {
      data: 'modality2NbValue',
      title: Render.icon('value') + 'Valeurs',
      tooltip: 'Nombre de valeurs de la modalité 2',
      render: Render.num,
    },
    {
      data: 'modality2NbVariable',
      title: Render.icon('variable') + 'Variables',
      tooltip: 'Nombre de variables liées à la modalité 2',
      render: Render.num,
    },
  ]
</script>

{#if loading && similitutes.length === 0}
  <Loading type="tabBody" colorEntity="compare" />
{:else if similitutes.length > 0}
  <Datatable entity="compare" data={similitutes} {columns} sortByName={true} />
{:else}
  <div style="padding: 20px; text-align: center;">
    Aucune similitude trouvée
  </div>
{/if}
