<script lang="ts">
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
  import MetaLocalisationInfo from "@infoTable/MetaLocalisationInfo.svelte"

  let { variable } = $props()

  let parent_name = variable.is_meta ? "metaDataset" : "dataset"
</script>

<TableWrapper>
  <IdInfo id={variable.id} />
  {#if variable.original_name}
    <tr>
      <td>
        <Icon type="name" />
        Nom d'origine
      </td>
      <td>
        {variable.original_name}
      </td>
    </tr>
  {/if}
  <tr>
    <td>
      <Icon type="dataset" />
      Dataset
    </td>
    <td>
      <Link href="{parent_name}/{variable.dataset_id}" entity="dataset"
        >{variable.dataset_name}</Link
      >
    </td>
  </tr>
  <TagsInfo tags={variable.tags} />
  <TypeInfo type={variable.type_clean} />
  {#if variable.key}
    <tr>
      <td>
        <Icon type="key" />
        Clé
      </td>
      <td>
        {variable.key}
      </td>
    </tr>
  {/if}
  <tr>
    <td>
      <Icon type="hashtag" />
      Position
    </td>
    <td>
      {variable.num}
    </td>
  </tr>
  <PeriodInfo
    period={variable.period}
    period_duration={variable.period_duration}
  />
  <RowInfo nb_row={variable.nb_row} />
  {#if variable.nb_missing > 0}
    <tr>
      <td>
        <Icon type="missing" />
        Manquants
      </td>
      <td>
        <PercentBar
          type="missing"
          value={variable.nb_missing}
          nb_row={variable.nb_row}
        />
      </td>
    </tr>
  {/if}
  {#if variable.nb_duplicate > 0}
    <tr>
      <td>
        <Icon type="duplicate" />
        Doublons
      </td>
      <td>
        <PercentBar
          type="duplicate"
          value={variable.nb_duplicate}
          nb_row={variable.nb_row}
        />
      </td>
    </tr>
  {/if}
  {#if variable.nb_distinct > 0}
    <tr>
      <td>
        <Icon type="value" />
        Valeurs
      </td>
      <td>
        <PercentBar
          type="value"
          value={variable.nb_distinct}
          nb_row={variable.nb_row}
        />
      </td>
    </tr>
  {/if}
  {#if variable.modalities?.length > 0}
    <tr>
      <td>
        <Icon type="modality" />
        Modalités
      </td>
      <td>
        <nav class="breadcrumb has-bullet-separator" aria-label="breadcrumbs">
          <ul>
            {#each variable.modalities as modality}
              <li>
                <Link href="modality/{modality.id}" entity="modality">
                  {modality.name}
                </Link>
              </li>
            {/each}
          </ul>
        </nav>
      </td>
    </tr>
  {/if}
  {#if variable.is_meta}
    <MetaLocalisationInfo meta_localisation={variable.meta_localisation} />
  {/if}
</TableWrapper>
<DescriptionInfo description={variable.description} />

<style lang="scss">
  @use "main.scss" as *;

  .breadcrumb {
    :global(a) {
      color: $color-1;
    }
  }
</style>
