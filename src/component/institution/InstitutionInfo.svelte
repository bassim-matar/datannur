<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import TableWrapper from '@info-table/TableWrapper.svelte'
  import DescriptionInfo from '@info-table/DescriptionInfo.svelte'
  import IdInfo from '@info-table/IdInfo.svelte'
  import InstitutionInfo from '@info-table/InstitutionInfo.svelte'
  import TagsInfo from '@info-table/TagsInfo.svelte'
  import DeepLevelInfo from '@info-table/DeepLevelInfo.svelte'
  import PeriodInfo from '@info-table/PeriodInfo.svelte'

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
  <PeriodInfo
    period={institution.period}
    period_duration={institution.period_duration}
  />
</TableWrapper>
<DescriptionInfo description={institution.description} />
