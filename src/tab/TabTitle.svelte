<script lang="ts">
  import { allTabs, tabSelected } from '@lib/store'
  import Icon from '@layout/Icon.svelte'
  import Loading from '@frame/Loading.svelte'
  import Number from '@layout/Number.svelte'
  import { onMount } from 'svelte'

  let { tab, activeTab = $bindable(), selectTab } = $props()

  let tabNb = $state(tab.nb)
  let minWidth = $state(0)

  function toPercent(value) {
    const separator = '|'
    const splited = value.split(separator)
    if (splited.length === 1) return false
    return splited[1].split('%')[0]
  }

  onMount(() => {
    const selector = `.tab_li_${tab.key}`
    const elem = document.querySelector(selector) as HTMLLIElement
    minWidth = elem.offsetWidth
    if (minWidth > 500) minWidth = 0
  })

  $effect(() => {
    if (activeTab === tab.key && tabNb !== '...') {
      setTimeout(() => {
        minWidth = 0
      }, 300)
    }
  })

  $effect(() => {
    if (activeTab === tab.key) tabNb = $allTabs[tab.icon].nb
  })
</script>

<li
  class="tab_li_{tab.key} tab_entity_{tab.icon} shadow_{$tabSelected.icon}"
  class:is-active={activeTab === tab.key}
  class:not_active={activeTab !== tab.key}
  style="min-width: {minWidth}px;"
>
  <div class="rounded_wrapper left">
    <div class="rounded left"></div>
  </div>
  <div class="rounded_wrapper right">
    <div class="rounded right"></div>
  </div>

  <a
    href={null}
    onclick={() => selectTab(tab)}
    class="tab_select_btn"
    class:is_loaded={tabNb > 0 ||
      tabNb === undefined ||
      tabNb === '?' ||
      (tabNb?.length > 0 && tabNb !== '...')}
  >
    <div>
      {#if tabNb !== undefined}
        {#if tabNb === '...'}
          <Loading type="tab" colorEntity={tab.icon} />
        {:else if tabNb === parseInt(tabNb)}
          <span class="num_style tab_visible">
            <Number number={tabNb} />
          </span>
        {:else}
          <span class="num_style tab_visible">{tabNb}</span>
        {/if}
      {/if}
    </div>

    <div>
      <span class="tab_visible icon_wrapper">
        <Icon type={tab.icon} marginRight={false} mode="compact" />
      </span>
      <span>
        {#if tabNb !== undefined && tabNb !== '...' && tabNb !== parseInt(tabNb)}
          <span class="percent_wrapper">
            <span class="percent" style="width: {100 - toPercent(tabNb)}%"
            ></span>
          </span>
        {/if}
        <span class="tab_visible tab_name">
          {tab.name}
        </span>
      </span>
    </div>
  </a>
</li>

<style lang="scss">
  @use 'main.scss' as *;

  .tab_visible {
    position: relative;
    z-index: 2;
  }

  li {
    border: 1px solid transparent;
    border-bottom: 0;
    height: 38px;
    &.is-active {
      border-color: $color-5;
      a.tab_select_btn {
        background: $background-2;
        z-index: 2;
        .percent_wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          opacity: 0.2;
          overflow: hidden;
        }
        .percent {
          float: right;
          height: 100%;
          background-image: linear-gradient(0deg, $background-2, $background-1);
          background: $background-1;
          opacity: 1;
        }
      }
    }
  }
  a.tab_select_btn {
    position: relative;
    border: 0;
    justify-content: left;
    padding-left: 0;
    padding-right: 8px;
    padding-top: 10px;
    font-size: 14px;
    flex-direction: column;
    .num_style {
      font-size: 12px;
      display: block;
      line-height: 0px;
      margin-top: -2px;
      padding-left: 8px;
      text-align: center;
    }
    .icon_wrapper {
      height: 24px;
      :global(.icon) {
        margin-left: 8px;
        margin-right: 0;
      }
    }
    &:hover,
    .is-active & {
      color: $color-3;
      background: transparent;
    }
  }

  li {
    @each $entity in $entities {
      &.tab_entity_#{$entity} {
        a.tab_select_btn:hover {
          color: #{color($entity)} !important;
        }
      }
    }
  }
  li.is-active {
    @each $entity in $entities {
      &.tab_entity_#{$entity} {
        a.tab_select_btn {
          color: #{color($entity)} !important;
        }
      }
    }
  }

  @each $entity in $entities {
    .tab_entity_#{$entity} {
      .percent_wrapper {
        background: #{color($entity)};
      }
    }
  }

  :global(html.rounded_design) {
    a.tab_select_btn {
      border-radius: $rounded-top;
    }
    li.not_active a.tab_select_btn:hover {
      border-radius: $rounded-size;
      border-bottom-color: transparent;
    }

    li.is-active {
      position: relative;
      border-radius: $rounded-top;
      .rounded_wrapper {
        content: '';
        position: absolute;
        height: 20px;
        width: 20px;
        bottom: 0;
        background: $background-2;
        z-index: 1;
        &.left {
          left: -20px;
          border-top-left-radius: 20px;
        }
        &.right {
          right: -20px;
          border-top-right-radius: 20px;
        }
        .rounded {
          height: 20px;
          width: 20px;
          background: $background-1;
          border-bottom: 1px solid $color-5;
          &.left {
            border-radius: 20px 0 20px 0;
            border-right: 1px solid $color-5;
          }
          &.right {
            border-radius: 0 20px 0 20px;
            border-left: 1px solid $color-5;
          }
        }
      }

      a.tab_select_btn {
        .percent_wrapper {
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }
      }
    }
    :global(.tabs:not(.no-first-tab)) {
      li.is-active .rounded_wrapper.left {
        display: none;
      }
    }
    :global(.tabs.is-last-tab) {
      li.is-active .rounded_wrapper.right {
        display: none;
      }
    }
  }

  :global(html.page_shadow_colored) {
    li {
      @each $entity in $entities {
        &.tab_entity_#{$entity} {
          a.tab_select_btn:hover {
            color: #{color($entity)} !important;
          }
        }

        &.shadow_#{$entity} {
          &.is-active {
            border-color: #{color($entity)};

            a.tab_select_btn {
              color: #{color($entity)};
            }
            .rounded_wrapper .rounded,
            .rounded_wrapper .rounded.left,
            .rounded_wrapper .rounded.right {
              border-color: #{color($entity)};
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 600px) {
    .tab_name {
      display: none;
    }
  }
</style>
