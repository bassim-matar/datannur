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

  let { folder } = $props()
</script>

<TableWrapper>
  <IdInfo id={folder.id} />
  {#if !folder.is_meta}
    <DeepLevelInfo level={folder.parents.length + 1} />
    {#if folder.parent_id}
      <FolderInfo folder_id={folder.id} is_self={true} />
    {/if}
    <InstitutionInfo type="owner" institution_id={folder.owner_id} />
    <InstitutionInfo type="manager" institution_id={folder.manager_id} />
    <TagsInfo tags={folder.tags} />
    <LocalisationInfo localisation={folder.localisation} />
    {#if folder.survey_type}
      <tr>
        <td><Icon type="survey_type" /> Type d'enquête</td>
        <td>{folder.survey_type}</td>
      </tr>
    {/if}
    <DeliveryFormatInfo delivery_format={folder.delivery_format} />
    <FrequencyInfo frequency={folder.updating_each} />
    <LastUpdateInfo last_update_date={folder.last_update_date} />
    <PeriodInfo period={folder.period} />
    {#if folder.metadata_path}
      <tr>
        <td><Icon type="metadata_path" /> Metadonnées</td>
        <td><CopyText text={folder.metadata_path} /></td>
      </tr>
    {/if}
    <DataPathInfo data_path={folder.data_path} />
    {#if folder.git_code}
      <tr>
        <td><Icon type="git_code" /> GIT code</td>
        <td>
          <a href={folder.git_code} target="_blanck" class="break_line">
            {folder.git_code}
          </a>
        </td>
      </tr>
    {/if}
  {/if}
</TableWrapper>
<DescriptionInfo description={folder.description} />
