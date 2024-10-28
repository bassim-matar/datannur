<script>
  import Icon from "@layout/Icon.svelte"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import InstitutionInfo from "@infoTable/InstitutionInfo.svelte"
  import TagsInfo from "@infoTable/TagsInfo.svelte"
  import DeepLevelInfo from "@infoTable/DeepLevelInfo.svelte"

  let { institution_info } = $props()
</script>

<TableWrapper>
  <IdInfo id={institution_info.id} />
  <DeepLevelInfo level={institution_info.parents.length + 1} />
  {#if institution_info.parent_id}
    <InstitutionInfo institution_id={institution_info.id} is_self={true} />
  {/if}
  <TagsInfo tags={institution_info.tags} />
  {#if institution_info.email}
    <tr>
      <td>
        <Icon type="email" />
        Email
      </td>
      <td>
        <a href="mailto:{institution_info.email}" target="_blanck">
          {institution_info.email}
        </a>
      </td>
    </tr>
  {/if}
  {#if institution_info.phone}
    <tr>
      <td>
        <Icon type="phone" />
        Téléphone
      </td>
      <td>
        <a href="tel:{institution_info.phone}" target="_blanck">
          {institution_info.phone}
        </a>
      </td>
    </tr>
  {/if}
</TableWrapper>
<DescriptionInfo description={institution_info.description} />
