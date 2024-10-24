<script>
  import markdown_render from "@js/markdown"
  import Icon from "@layout/Icon.svelte"

  export let description
  export let inside_table = false

  let description_clean = description

  if (description) {
    description_clean = markdown_render(description)
  }
</script>

{#if description}
  {#if inside_table}
    <tr>
      <td>
        <div style="font-weight: bold;">
          <Icon type="description" /> Description
        </div>
      </td>
      <td>
        <div class="content inside_table">{@html description_clean}</div>
      </td>
    </tr>
  {:else}
    <div class="description_wrapper" class:inside_table>
      <div style="font-weight: bold;">
        <Icon type="description" /> Description
      </div>
      <div class="content">{@html description_clean}</div>
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
    &.inside_table {
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
      & > div {
        padding: 10px;
        padding-top: 0;
      }
    }
    .content {
      max-width: calc(100vw - 50px);
    }
  }
</style>
