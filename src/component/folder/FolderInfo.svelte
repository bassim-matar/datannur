<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import FolderInfo from '@info-table/FolderInfo.svelte'
  import InstitutionInfo from '@info-table/InstitutionInfo.svelte'
  import TagsInfo from '@info-table/TagsInfo.svelte'
  import LastUpdateInfo from '@info-table/LastUpdateInfo.svelte'
  import NextUpdateInfo from '@info-table/NextUpdateInfo.svelte'
  import FrequencyInfo from '@info-table/FrequencyInfo.svelte'
  import LocalisationInfo from '@info-table/LocalisationInfo.svelte'
  import PeriodInfo from '@info-table/PeriodInfo.svelte'
  import DataPathInfo from '@info-table/DataPathInfo.svelte'
  import CopyText from '@layout/CopyText.svelte'
  import DeliveryFormatInfo from '@info-table/DeliveryFormatInfo.svelte'
  import DeepLevelInfo from '@info-table/DeepLevelInfo.svelte'

  let { folder } = $props()
</script>

<TableWrapper>
  <IdInfo id={folder.id} />
  {#if !folder.isMeta}
    <DeepLevelInfo level={folder.parents.length + 1} />
    {#if folder.parent_id}
      <FolderInfo folderId={folder.id} isSelf={true} />
    {/if}
    <InstitutionInfo type="owner" institutionId={folder.owner_id} />
    <InstitutionInfo type="manager" institutionId={folder.manager_id} />
    <TagsInfo tags={folder.tags} />
    <LastUpdateInfo lastUpdateDate={folder.last_update_date} />
    <NextUpdateInfo nextUpdateDate={folder.next_update_date} />
    <FrequencyInfo frequency={folder.updating_each} />
    <PeriodInfo period={folder.period} periodDuration={folder.periodDuration} />
    <LocalisationInfo localisation={folder.localisation} />
    {#if folder.survey_type}
      <tr>
        <td><Icon type="survey_type" /> Type d'enquête</td>
        <td>{folder.survey_type}</td>
      </tr>
    {/if}
    <DeliveryFormatInfo deliveryFormat={folder.delivery_format} />
    {#if folder.metadata_path}
      <tr>
        <td><Icon type="metadata_path" /> Metadonnées</td>
        <td><CopyText text={folder.metadata_path} /></td>
      </tr>
    {/if}
    <DataPathInfo dataPath={folder.data_path} />
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
