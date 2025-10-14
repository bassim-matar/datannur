<script lang="ts">
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import FolderInfo from '@info-table/FolderInfo.svelte'
  import RowInfo from '@info-table/RowInfo.svelte'
  import LastUpdateInfo from '@info-table/LastUpdateInfo.svelte'
  import MetaDatasetRelations from '@info-table/MetaDatasetRelations.svelte'
  import MetaLocalisationInfo from '@info-table/MetaLocalisationInfo.svelte'
  import type { MetaDataset } from '@type'

  let { metaDataset }: { metaDataset: MetaDataset } = $props()
</script>

<TableWrapper>
  <IdInfo id={metaDataset.id} />
  <FolderInfo folderId={metaDataset.metaFolderId} isMeta={true} />
  <RowInfo nbRow={metaDataset.nbRow} />
  <LastUpdateInfo
    lastUpdateDate={metaDataset.lastUpdateTimestamp}
    intraday={true}
    fromTimestamp={true}
  />
  <MetaDatasetRelations datasetId={metaDataset.id} />
  <MetaLocalisationInfo metaLocalisation={metaDataset.metaLocalisation} />
</TableWrapper>

<DescriptionInfo description={metaDataset.description} />
