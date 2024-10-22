<script>
  import Options from "@js/Options"
  import Loading from "@frame/Loading.svelte"
  import { tab_selected } from "@js/store"
  import { onMount } from "svelte"

  export let tabs
  export let no_first_tab
  export let is_last_tab
  export let active_tab_body
  export let tabs_loaded

  let open_all_tab = Options.get("open_all_tab")

  const html_div = document.querySelector("html")

  function update_ancestor_height() {
    const tabs_container_div = document.getElementById("tabs_container")
    const tabs_container_height =
      tabs_container_div?.getBoundingClientRect().height
    html_div.style.setProperty(
      "--tabs-container-height",
      tabs_container_height + "px",
    )

    const footer_div = document.querySelector("footer.footer")
    const footer_height = footer_div?.getBoundingClientRect().height || 0
    html_div.style.setProperty("--footer-height", footer_height + "px")
  }

  onMount(() => {
    update_ancestor_height()
  })

  $: if (active_tab_body) {
    setTimeout(() => update_ancestor_height(), 1)
  }
</script>

<svelte:window on:resize={update_ancestor_height} />

<div
  class="tabs_body box_shadow box_shadow_color shadow_{$tab_selected.icon}"
  class:no_first_tab
  class:is_last_tab
>
  {#if active_tab_body === "loading"}
    <div class="tabs_loading_wrapper">
      <Loading position="absolute" />
    </div>
  {/if}
  {#each tabs as tab}
    {#if open_all_tab || active_tab_body === tab.key || tabs_loaded[tab.key] > 0}
      <div
        class="tab_component_wrapper {tab.props.class || ''}"
        class:visible={active_tab_body === tab.key}
        class:padding={tab.padding}
        class:has_footer={tab.footer_visible}
      >
        <svelte:component this={tab.component} {...tab.props} />
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  @use "../main.scss" as *;

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
      max-height: max(
        100vh - var(--tabs-container-height) - var(--footer-height) - 140px,
        170px
      );
      &:not(.has_footer) {
        max-height: 100%;
      }
      &:not(.visible) {
        position: absolute;
        height: 0px;
        overflow: hidden;
        opacity: 0;
        width: 100%;
        pointer-events: none;
        z-index: -999999;
      }
      &.padding {
        padding: 3rem 3rem;
      }
    }
  }

  :global(html.rounded_design) {
    .tabs_body {
      border-radius: $rounded-bottom;
      border-top-right-radius: $rounded-size;
    }
    .tabs_body.no_first_tab {
      border-top-left-radius: $rounded-size;
    }
    .tabs_body.is_last_tab {
      border-top-right-radius: initial;
    }
  }

  .tabs_body:not(:has(.tab_component_wrapper.visible .datatable_main_wrapper)) {
    overflow: hidden;
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
