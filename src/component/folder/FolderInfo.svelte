<script>
  import Icon from "@layout/Icon.svelte"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import FolderInfo from "@infoTable/FolderInfo.svelte"
  import InstitutionInfo from "@infoTable/InstitutionInfo.svelte"
  import TagsInfo from "@infoTable/TagsInfo.svelte"
  import LastUpdateInfo from "@infoTable/LastUpdateInfo.svelte"
  import FrequencyInfo from "@infoTable/FrequencyInfo.svelte"
  import LocalisationInfo from "@infoTable/LocalisationInfo.svelte"
  import PeriodInfo from "@infoTable/PeriodInfo.svelte"
  import DataPathInfo from "@infoTable/DataPathInfo.svelte"
  import CopyText from "@layout/CopyText.svelte"
  import DeliveryFormatInfo from "@infoTable/DeliveryFormatInfo.svelte"
  import DeepLevelInfo from "@infoTable/DeepLevelInfo.svelte"

  export let folder_info
</script>

<TableWrapper>
  <IdInfo id={folder_info.id} />
  {#if !folder_info.is_meta}
    <DeepLevelInfo level={folder_info.parents.length + 1} />
    {#if folder_info.parent_id}
      <FolderInfo folder_id={folder_info.id} is_self={true} />
    {/if}
    <InstitutionInfo type="owner" institution_id={folder_info.owner_id} />
    <InstitutionInfo type="manager" institution_id={folder_info.manager_id} />
    <TagsInfo tags={folder_info.tags} />
    <LocalisationInfo localisation={folder_info.localisation} />
    {#if folder_info.survey_type}
      <tr>
        <td><Icon type="survey_type" /> Type d'enquête</td>
        <td>{folder_info.survey_type}</td>
      </tr>
    {/if}
    <DeliveryFormatInfo delivery_format={folder_info.delivery_format} />
    <FrequencyInfo frequency={folder_info.updating_each} />
    <LastUpdateInfo last_update_date={folder_info.last_update_date} />
    <PeriodInfo period={folder_info.period} />
    {#if folder_info.metadata_path}
      <tr>
        <td><Icon type="metadata_path" /> Metadonnées</td>
        <td><CopyText text={folder_info.metadata_path} /></td>
      </tr>
    {/if}
    <DataPathInfo data_path={folder_info.data_path} />
    {#if folder_info.git_code}
      <tr>
        <td><Icon type="git_code" /> GIT code</td>
        <td>
          <a href={folder_info.git_code} target="_blanck" class="break_line">
            {folder_info.git_code}
          </a>
        </td>
      </tr>
    {/if}
  {/if}
</TableWrapper>
<DescriptionInfo description={folder_info.description} />
