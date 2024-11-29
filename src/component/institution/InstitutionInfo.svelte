<script>
  import Icon from "@layout/Icon.svelte"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import InstitutionInfo from "@infoTable/InstitutionInfo.svelte"
  import TagsInfo from "@infoTable/TagsInfo.svelte"
  import DeepLevelInfo from "@infoTable/DeepLevelInfo.svelte"

  let { institution } = $props()
</script>

<TableWrapper>
  <IdInfo id={institution.id} />
  <DeepLevelInfo level={institution.parents.length + 1} />
  {#if institution.parent_id}
    <InstitutionInfo institution_id={institution.id} is_self={true} />
  {/if}
  <TagsInfo tags={institution.tags} />
  {#if institution.email}
    <tr>
      <td><Icon type="email" /> Email</td>
      <td>
        <a href="mailto:{institution.email}" target="_blanck">
          {institution.email}
        </a>
      </td>
    </tr>
  {/if}
  {#if institution.phone}
    <tr>
      <td><Icon type="phone" /> Téléphone</td>
      <td>
        <a href="tel:{institution.phone}" target="_blanck">
          {institution.phone}
        </a>
      </td>
    </tr>
  {/if}
</TableWrapper>
<DescriptionInfo description={institution.description} />
