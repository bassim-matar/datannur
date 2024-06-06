<script>
  import { tab_selected } from "@js/store"
  import Icon from "@layout/Icon.svelte"
  import Loading from "@frame/Loading.svelte"
  import Number from "@layout/Number.svelte"
  import { onMount } from "svelte"

  export let tab
  export let active_tab
  export let select_tab

  function to_percent(value) {
    const splited = value.split("-")
    if (splited.length === 1) return false
    return splited[1].split("%")[0]
  }

  let min_width
  onMount(() => {
    const selector = `.tab_li_${tab.key}`
    min_width = document.querySelector(selector).offsetWidth
  })
</script>

<li
  class="tab_li_{tab.key} tab_entity_{tab.icon} shadow_{$tab_selected.icon}"
  class:is-active={active_tab === tab.key}
  style="min-width: {min_width}px;"
>
  <div class="rounded_wrapper left">
    <div class="rounded left" />
  </div>
  <div class="rounded_wrapper right">
    <div class="rounded right" />
  </div>

  <a
    href={null}
    on:click={() => select_tab(tab)}
    class="tab_select_btn"
    class:is_loaded={tab.nb > 0 ||
      tab.nb === undefined ||
      tab.nb === "?" ||
      (tab.nb?.length > 0 && tab.nb !== "...")}
  >
    <span class="tab_visible icon_wrapper">
      <Icon type={tab.icon} />
    </span>
    <span>
      <span class="tab_visible">
        {tab.name}
      </span>
      {#if tab.nb !== undefined}
        {#if tab.nb === "..."}
          <Loading type="tab" color_entity={tab.icon}/>
        {:else if tab.nb === parseInt(tab.nb)}
          <span class="num_style tab_visible">
            <Number number={tab.nb} />
          </span>
        {:else}
          <span class="num_style tab_visible">{tab.nb}</span>
          <span class="percent_wrapper">
            <span class="percent" style="width: {100 - to_percent(tab.nb)}%" />
          </span>
        {/if}
      {/if}
    </span>
  </a>
</li>

<style lang="scss">
  @import "../main.scss";

  .tab_visible {
    position: relative;
    z-index: 2;
  }

  li {
    border: 1px solid transparent;
    border-bottom: 0;
    height: 40px;
    &.is-active {
      border-color: $color-5;
      a.tab_select_btn {
        background: $background-2;
        z-index: 2;
        .icon_wrapper {
          height: 24px;
        }
        .percent_wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
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
    padding-right: 1em;
    &:hover,
    .is-active & {
      color: $color-3;
      background: transparent;
    }
  }

  :global(html.rounded_design) {
    a.tab_select_btn {
      border-radius: $rounded-top;
    }
    li:not(.is-active) a.tab_select_btn:hover {
      border-radius: $rounded-size;
      border-bottom-color: transparent;
    }

    li.is-active {
      position: relative;
      border-radius: $rounded-top;
      .rounded_wrapper {
        content: "";
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
    :global(.tabs:not(.no_first_tab)) {
      li.is-active .rounded_wrapper.left {
        display: none;
      }
    }
    :global(.tabs.is_last_tab) {
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
</style>
