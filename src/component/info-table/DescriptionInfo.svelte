<script lang="ts">
  import markdownRender from '@lib/markdown'
  import Icon from '@layout/Icon.svelte'

  let { description, insideTable = false } = $props()

  let descriptionClean = $state(description)

  if (description) {
    descriptionClean = markdownRender(description)
  }
</script>

{#if description}
  {#if insideTable}
    <tr>
      <td>
        <div style="font-weight: bold;">
          <Icon type="description" /> Description
        </div>
      </td>
      <td>
        <!-- eslint-disable svelte/no-at-html-tags -->
        <div class="content inside-table">{@html descriptionClean}</div>
      </td>
    </tr>
  {:else}
    <div class="description_wrapper" class:inside-table={insideTable}>
      <div style="font-weight: bold;">
        <Icon type="description" /> Description
      </div>
      <!-- eslint-disable svelte/no-at-html-tags -->
      <div class="content">{@html descriptionClean}</div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .description_wrapper {
    width: calc(50% - 3px);
    padding: 1em 0.75em;
    box-sizing: border-box;
    display: inline-block;
  }
  .content {
    padding: 0.5em 2.5rem;
    max-width: 800px;
    word-wrap: break-word;
    box-sizing: border-box;
    &.inside-table {
      padding: 0;
      display: block;
      width: 100%;
    }
  }
  @media screen and (max-width: 1023px) {
    .description_wrapper {
      display: block;
      width: 100%;
      padding-top: 0;
    }
  }
  @media screen and (max-width: 600px) {
    .description_wrapper {
      .content {
        padding-top: 0px;
        padding-right: 5px;
      }
    }
  }
</style>
