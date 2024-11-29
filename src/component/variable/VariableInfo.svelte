<script>
  import Link from "@layout/Link.svelte"
  import Icon from "@layout/Icon.svelte"
  import TableWrapper from "@infoTable/TableWrapper.svelte"
  import DescriptionInfo from "@infoTable/DescriptionInfo.svelte"
  import IdInfo from "@infoTable/IdInfo.svelte"
  import RowInfo from "@infoTable/RowInfo.svelte"
  import TypeInfo from "@infoTable/TypeInfo.svelte"
  import PercentBar from "@infoTable/PercentBar.svelte"
  import PeriodInfo from "@infoTable/PeriodInfo.svelte"
  import TagsInfo from "@infoTable/TagsInfo.svelte"

  let { variable_info } = $props()

  let parent_name = variable_info.is_meta ? "metaDataset" : "dataset"
</script>

<TableWrapper>
  <IdInfo id={variable_info.id} />
  {#if variable_info.original_name}
    <tr>
      <td>
        <Icon type="name" />
        Nom d'origine
      </td>
      <td>
        {variable_info.original_name}
      </td>
    </tr>
  {/if}
  <tr>
    <td>
      <Icon type="dataset" />
      Dataset
    </td>
    <td>
      <Link href="{parent_name}/{variable_info.dataset_id}"
        >{variable_info.dataset_name}</Link
      >
    </td>
  </tr>
  <TagsInfo tags={variable_info.tags} />
  <TypeInfo type={variable_info.type_clean} />
  <tr>
    <td>
      <Icon type="hashtag" />
      Position
    </td>
    <td>
      {variable_info.num}
    </td>
  </tr>
  <PeriodInfo period={variable_info.period} />
  <RowInfo nb_row={variable_info.nb_row} />
  {#if variable_info.nb_missing > 0}
    <tr>
      <td>
        <Icon type="missing" />
        Manquants
      </td>
      <td>
        <PercentBar
          type="missing"
          value={variable_info.nb_missing}
          nb_row={variable_info.nb_row}
        />
      </td>
    </tr>
  {/if}
  {#if variable_info.nb_duplicate > 0}
    <tr>
      <td>
        <Icon type="duplicate" />
        Doublons
      </td>
      <td>
        <PercentBar
          type="duplicate"
          value={variable_info.nb_duplicate}
          nb_row={variable_info.nb_row}
        />
      </td>
    </tr>
  {/if}
  {#if variable_info.nb_distinct > 0}
    <tr>
      <td>
        <Icon type="value" />
        Valeurs
      </td>
      <td>
        <PercentBar
          type="value"
          value={variable_info.nb_distinct}
          nb_row={variable_info.nb_row}
        />
      </td>
    </tr>
  {/if}
  {#if variable_info.modalities?.length > 0}
    <tr>
      <td>
        <Icon type="modality" />
        Modalités
      </td>
      <td>
        <nav class="breadcrumb has-bullet-separator" aria-label="breadcrumbs">
          <ul>
            {#each variable_info.modalities as modality}
              <li>
                <Link href="modality/{modality.id}">
                  {modality.name}
                </Link>
              </li>
            {/each}
          </ul>
        </nav>
      </td>
    </tr>
  {/if}
</TableWrapper>
<DescriptionInfo description={variable_info.description} />

<style lang="scss">
  @use "../../main.scss" as *;

  .breadcrumb {
    :global(a) {
      color: $color-1;
    }
  }
</style>
