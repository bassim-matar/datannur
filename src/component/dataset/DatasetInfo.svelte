<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import InstitutionInfo from '@info-table/InstitutionInfo.svelte'
  import FolderInfo from '@info-table/FolderInfo.svelte'
  import TagsInfo from '@info-table/TagsInfo.svelte'
  import RowInfo from '@info-table/RowInfo.svelte'
  import FrequencyInfo from '@info-table/FrequencyInfo.svelte'
  import LastUpdateInfo from '@info-table/LastUpdateInfo.svelte'
  import NextUpdateInfo from '@info-table/NextUpdateInfo.svelte'
  import LocalisationInfo from '@info-table/LocalisationInfo.svelte'
  import PeriodInfo from '@info-table/PeriodInfo.svelte'
  import DataPathInfo from '@info-table/DataPathInfo.svelte'
  import DeliveryFormatInfo from '@info-table/DeliveryFormatInfo.svelte'
  import MetaDatasetRelations from '@info-table/MetaDatasetRelations.svelte'
  import MetaLocalisationInfo from '@info-table/MetaLocalisationInfo.svelte'

  let { dataset } = $props()
</script>

<TableWrapper>
  <IdInfo id={dataset.id} />
  <InstitutionInfo type="owner" institutionId={dataset.owner_id} />
  <InstitutionInfo type="manager" institutionId={dataset.manager_id} />
  <FolderInfo
    folderId={dataset.isMeta ? dataset.metaFolder_id : dataset.folder_id}
    isMeta={dataset.isMeta}
  />
  <TagsInfo tags={dataset.tags} />
  {#if dataset.typeClean}
    <tr>
      <td><Icon type="type" /> Type</td>
      <td>{dataset.typeClean}</td>
    </tr>
  {/if}
  <RowInfo nbRow={dataset.nb_row} />
  {#if dataset.isMeta}
    <LastUpdateInfo
      lastUpdateDate={dataset.lastUpdateTimestamp}
      intraday={true}
      fromTimestamp={true}
    />
  {:else}
    <LastUpdateInfo lastUpdateDate={dataset.last_update_date} />
    <NextUpdateInfo nextUpdateDate={dataset.nextUpdateDate} />
  {/if}
  <FrequencyInfo frequency={dataset.updating_each} />
  <PeriodInfo period={dataset.period} periodDuration={dataset.periodDuration} />
  <LocalisationInfo localisation={dataset.localisation} />
  <DeliveryFormatInfo deliveryFormat={dataset.delivery_format} />
  <DataPathInfo dataPath={dataset.data_path} />
  {#if dataset.link}
    <tr>
      <td><Icon type="downloadFile" /> Données</td>
      <td>
        <a href={dataset.link} target="_blanck" class="break_line">
          {dataset.link}
        </a>
      </td>
    </tr>
  {/if}
  {#if dataset.isMeta}
    <MetaDatasetRelations datasetId={dataset.id} />
    <MetaLocalisationInfo metaLocalisation={dataset.metaLocalisation} />
  {/if}
</TableWrapper>

<DescriptionInfo description={dataset.description} />
