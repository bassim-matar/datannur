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
  import LocalisationInfo from "@infoTable/LocalisationInfo.svelte"
  import PeriodInfo from "@infoTable/PeriodInfo.svelte"
  import DataPathInfo from "@infoTable/DataPathInfo.svelte"
  import DeliveryFormatInfo from "@infoTable/DeliveryFormatInfo.svelte"

  export let dataset_info
</script>

<TableWrapper>
  <IdInfo id={dataset_info.id} />
  <InstitutionInfo type="owner" institution_id={dataset_info.owner_id} />
  <InstitutionInfo type="manager" institution_id={dataset_info.manager_id} />
  <FolderInfo
    folder_id={dataset_info.folder?.id}
    is_meta={dataset_info.is_meta}
  />
  <TagsInfo tags={dataset_info.tags} />
  {#if dataset_info.type_clean}
    <tr>
      <td>
        <Icon type="type" />
        Type
      </td>
      <td>
        {dataset_info.type_clean}
      </td>
    </tr>
  {/if}
  <RowInfo nb_row={dataset_info.nb_row} />
  <LocalisationInfo localisation={dataset_info.localisation} />
  <DeliveryFormatInfo delivery_format={dataset_info.delivery_format} />
  <FrequencyInfo frequency={dataset_info.updating_each} />
  <LastUpdateInfo last_update_date={dataset_info.last_update_date} />
  <PeriodInfo period={dataset_info.period} />
  <DataPathInfo data_path={dataset_info.data_path} />
  {#if dataset_info.link}
    <tr>
      <td>
        <Icon type="download_file" />
        Données
      </td>
      <td>
        <a href={dataset_info.link} target="_blanck" class="break_line">
          {dataset_info.link}
        </a>
      </td>
    </tr>
  {/if}
</TableWrapper>

<DescriptionInfo description={dataset_info.description} />
