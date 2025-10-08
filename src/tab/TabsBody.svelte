<script lang="ts">
  import Options from '@lib/options'
  import Loading from '@frame/Loading.svelte'
  import { tabSelected } from '@lib/store'

  let { tabs, noFirstTab, isLastTab, activeTabBody, tabsLoaded } = $props()

  let openAllTab = Options.get('openAllTab')
</script>

<div
  class="tabs-body box-shadow box-shadow-color shadow-{$tabSelected.icon}"
  class:no-first-tab={noFirstTab}
  class:is-last-tab={isLastTab}
>
  {#if activeTabBody === 'loading'}
    <div class="tabs-loading-wrapper">
      <Loading position="absolute" />
    </div>
  {/if}
  {#each tabs as tab (tab.key)}
    {#if openAllTab || activeTabBody === tab.key || tabsLoaded[tab.key] > 0}
      <div
        class="tab-component-wrapper {tab.props.class ?? ''}"
        class:visible={activeTabBody === tab.key}
        class:not-visible={activeTabBody !== tab.key}
        class:padding={tab.padding}
        class:has-footer={tab.footerVisible}
        class:without-footer={!tab.footerVisible}
      >
        <tab.component {...tab.props} />
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .tabs-body {
    position: relative;
    background: $background-2;
    border: 1px solid transparent;
    border-color: $color-5;
    transition: border-color 1s;
    .tabs-loading-wrapper {
      position: relative;
      height: 150px;
    }
    .tab-component-wrapper {
      left: 0;
      top: 0;
      right: 0;
      opacity: 1;
      overflow: auto;
      &.padding {
        padding: 3rem 3rem;
      }
      &.without-footer {
        max-height: 100%;
      }
      &.not-visible {
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

  :global(html.roundedDesign) {
    .tabs-body {
      border-radius: $rounded-bottom;
      border-top-right-radius: $rounded-size;
    }
    .tabs-body.no-first-tab {
      border-top-left-radius: $rounded-size;
    }
    .tabs-body.is-last-tab {
      border-top-right-radius: initial;
    }
  }

  .tabs-body {
    overflow: hidden;
  }
  .tabs-body:global(
    :has(.tab-component-wrapper.visible .datatable-main-wrapper)
  ) {
    overflow: visible !important;
  }

  :global(html.pageShadowColored) .tabs-body {
    @each $entity in $entities {
      &.shadow-#{$entity} {
        border-color: #{color($entity)};
      }
    }
  }

  @media screen and (max-width: 600px) {
    .tabs-body {
      .tab-component-wrapper.padding {
        padding: 10px;
      }
    }
  }
</style>
