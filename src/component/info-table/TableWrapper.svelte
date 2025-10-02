<script lang="ts">
  import { onMount } from 'svelte'
  import { pageContentLoaded } from '@lib/store'

  let { noMaxHeight = true, children } = $props()

  onMount(() => {
    $pageContentLoaded = true
  })
</script>

<div class="table-wrapper" class:no-max-height={noMaxHeight}>
  <table class="table is-striped">
    <tbody>
      {@render children?.()}
    </tbody>
  </table>
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .table-wrapper {
    display: inline-block;
    vertical-align: top;
    width: calc(50% - 3px);
    max-height: max(100vh - 280px, 170px);
    overflow: hidden;
    padding: 0.5em 0;

    :global(html.roundedDesign) & {
      border-bottom-left-radius: $rounded;
    }

    &.no-max-height {
      max-height: none;
    }
    .table {
      width: 100%;
      background: transparent;
      :global(td:first-child) {
        width: 1%;
        white-space: nowrap;
      }
      tbody :global(td) {
        border: 0;
        position: relative;
      }
    }
  }

  .table-wrapper {
    tbody :global(td:first-child) {
      font-weight: bold;
    }
  }

  @media screen and (max-width: 1023px) {
    .table-wrapper {
      display: block;
      width: 100%;
      :global(html.roundedDesign) & {
        border-bottom-right-radius: $rounded;
      }
    }
  }

  @media screen and (max-width: 600px) {
    .table-wrapper {
      max-height: none;
      overflow-y: auto;
      .table :global(tr) {
        display: block;
        padding: 10px;
        box-sizing: border-box;
      }
      .table :global(td) {
        display: block;
        box-sizing: border-box;
        padding-top: 0;
        padding-bottom: 0;
        clear: both;
        border: 0px;
        width: 100%;
        padding-left: 40px;
      }
      .table :global(td:first-child) {
        padding-left: 0px;
      }
    }
  }
</style>
