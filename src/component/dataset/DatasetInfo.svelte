<script>
  import Icon from "@layout/Icon.svelte"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import InstitutionInfo from "@infoTable/InstitutionInfo.svelte"
  import FolderInfo from "@infoTable/FolderInfo.svelte"
  import TagsInfo from "@infoTable/TagsInfo.svelte"
  import RowInfo from "@infoTable/RowInfo.svelte"
  import FrequencyInfo from "@infoTable/FrequencyInfo.svelte"
  import LastUpdateInfo from "@infoTable/LastUpdateInfo.svelte"
  import NextUpdateInfo from "@infoTable/NextUpdateInfo.svelte"
  import LocalisationInfo from "@infoTable/LocalisationInfo.svelte"
  import PeriodInfo from "@infoTable/PeriodInfo.svelte"
  import DataPathInfo from "@infoTable/DataPathInfo.svelte"
  import DeliveryFormatInfo from "@infoTable/DeliveryFormatInfo.svelte"
  import MetaDatasetRelations from "@infoTable/MetaDatasetRelations.svelte"
  import MetaLocalisationInfo from "@infoTable/MetaLocalisationInfo.svelte"

  let { dataset } = $props()
</script>

<TableWrapper>
  <IdInfo id={dataset.id} />
  <InstitutionInfo type="owner" institution_id={dataset.owner_id} />
  <InstitutionInfo type="manager" institution_id={dataset.manager_id} />
  <FolderInfo folder_id={dataset.folder?.id} is_meta={dataset.is_meta} />
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
