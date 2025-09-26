<script lang="ts">
  import Options from '@lib/options'
  import Loading from '@frame/Loading.svelte'
  import { tabSelected } from '@lib/store'

  let { tabs, noFirstTab, isLastTab, activeTabBody, tabsLoaded } = $props()

  let openAllTab = Options.get('open_all_tab')
</script>

<div
  class="tabs_body box_shadow box_shadow_color shadow_{$tabSelected.icon}"
  class:no-first-tab={noFirstTab}
  class:is-last-tab={isLastTab}
>
  {#if activeTabBody === 'loading'}
    <div class="tabs_loading_wrapper">
      <Loading position="absolute" />
    </div>
  {/if}
  {#each tabs as tab (tab.key)}
    {#if openAllTab || activeTabBody === tab.key || tabsLoaded[tab.key] > 0}
      <div
        class="tab_component_wrapper {tab.props.class || ''}"
        class:visible={activeTabBody === tab.key}
        class:not_visible={activeTabBody !== tab.key}
        class:padding={tab.padding}
        class:has_footer={tab.footerVisible}
        class:without_footer={!tab.footerVisible}
      >
        <tab.component {...tab.props} />
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .tabs_body {
    position: relative;
    background: $background-2;
    border: 1px solid transparent;
    border-color: $color-5;
    transition: border-color 1s;
    .tabs_loading_wrapper {
      position: relative;
      height: 150px;
    }
    .tab_component_wrapper {
      left: 0;
      top: 0;
      right: 0;
      opacity: 1;
      overflow: auto;
      &.padding {
        padding: 3rem 3rem;
      }
      &.without_footer {
        max-height: 100%;
      }
      &.not_visible {
        position: absolute;
        height: 0px;
        overflow: hidden;
        opacity: 0;
        width: 100%;
        pointer-events: none;
        z-index: -999999;
      }
    }
  }

  :global(html.rounded_design) {
    .tabs_body {
      border-radius: $rounded-bottom;
      border-top-right-radius: $rounded-size;
    }
    .tabs_body.no-first-tab {
      border-top-left-radius: $rounded-size;
    }
    .tabs_body.is-last-tab {
      border-top-right-radius: initial;
    }
  }

  .tabs_body {
    overflow: hidden;
  }
  .tabs_body:global(
    :has(.tab_component_wrapper.visible .datatable_main_wrapper)
  ) {
    overflow: visible !important;
  }

  :global(html.page_shadow_colored) .tabs_body {
    @each $entity in $entities {
      &.shadow_#{$entity} {
        border-color: #{color($entity)};
      }
    }
  }

  @media screen and (max-width: 600px) {
    .tabs_body {
      .tab_component_wrapper.padding {
        padding: 10px;
      }
    }
  }
</style>
