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
  <InstitutionInfo type="owner" institution_id={dataset.owner_id} />
  <InstitutionInfo type="manager" institution_id={dataset.manager_id} />
  <FolderInfo
    folder_id={dataset.is_meta ? dataset.metaFolder_id : dataset.folder_id}
    is_meta={dataset.is_meta}
  />
  <TagsInfo tags={dataset.tags} />
  {#if dataset.type_clean}
    <tr>
      <td><Icon type="type" /> Type</td>
      <td>{dataset.type_clean}</td>
    </tr>
  {/if}
  <RowInfo nb_row={dataset.nb_row} />
  {#if dataset.is_meta}
    <LastUpdateInfo
      last_update_date={dataset.last_update_timestamp}
      intraday={true}
      from_timestamp={true}
    />
  {:else}
    <LastUpdateInfo last_update_date={dataset.last_update_date} />
    <NextUpdateInfo next_update_date={dataset.next_update_date} />
  {/if}
  <FrequencyInfo frequency={dataset.updating_each} />
  <PeriodInfo
    period={dataset.period}
    period_duration={dataset.period_duration}
  />
  <LocalisationInfo localisation={dataset.localisation} />
  <DeliveryFormatInfo delivery_format={dataset.delivery_format} />
  <DataPathInfo data_path={dataset.data_path} />
  {#if dataset.link}
    <tr>
      <td><Icon type="download_file" /> Données</td>
      <td>
        <a href={dataset.link} target="_blanck" class="break_line">
          {dataset.link}
        </a>
      </td>
    </tr>
  {/if}
  {#if dataset.is_meta}
    <MetaDatasetRelations dataset_id={dataset.id} />
    <MetaLocalisationInfo meta_localisation={dataset.meta_localisation} />
  {/if}
</TableWrapper>

<DescriptionInfo description={dataset.description} />
