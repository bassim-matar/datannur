<script>
  import MiniMasonry from "minimasonry"
  import { onMount, onDestroy } from "svelte"
  import Icon from "@layout/Icon.svelte"
  import { document_width, get_color } from "@js/util"
  import { entity_names } from "@js/constant"
  import attributs from "./attributs"
  import { add_values } from "./stat"
  import StatBox from "./StatBox.svelte"

  export let stat

  let masonry
  let show_all = true
  let visible = {}
  let entities = stat
  let loading = false

  onMount(() => {
    masonry = new MiniMasonry({
      container: ".all_stat_container",
      baseWidth: Math.min(document_width - 20, 300),
      gutter: 20,
      ultimateGutter: 20,
    })
    update_layout()
  })

  onDestroy(() => {
    masonry.destroy()
  })

  function update_layout() {
    loading = true
    setTimeout(() => {
      masonry.layout()
      masonry.layout()
      setTimeout(() => (loading = false), 100)
    }, 1)
  }

  function show(entity) {
    for (const key in visible) {
      visible[key] = key === entity
    }
    show_all = false
    update_layout()
  }

  function click_show_all() {
    for (const key in visible) {
      visible[key] = false
    }
    show_all = true
    update_layout()
  }

  entities = entities.filter(x => x.items?.length > 0)
  entities.forEach(entity => {
    visible[entity.entity] = false
    entity.with_html = entity.entity === "log"
    entity.attributs = add_values(entity.items, attributs[entity.entity])
  })
</script>

{#if entities.length > 1}
  <div class="btns">
    <button
      class="button"
      class:box_shadow={show_all}
      class:box_shadow_color={show_all}
      style="color: {show_all ? get_color('entity') : ''}"
      on:click={click_show_all}
    >
      <Icon type="entity" /> Tout
    </button>
    {#each entities as { entity }}
      <button
        class="button shadow_{entity}"
        class:selected={visible[entity]}
        class:box_shadow_color={visible[entity]}
        style="color: {visible[entity] ? get_color(entity) : ''}"
        on:click={() => show(entity)}
      >
        <Icon type={entity} />
        {entity_names[entity]}
      </button>
    {/each}
  </div>
{/if}

<div class="main_wrapper">
  <div class="all_stat_container_wrappper" class:has_btns={entities.length > 1}>
    <div class="all_stat_container" class:loading>
      {#each entities as { entity, attributs, with_html }}
        {#if visible[entity] || show_all}
          {#each attributs as attribut}
            <StatBox {entity} {attribut} {with_html} />
          {/each}
        {/if}
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  @import "../main.scss";

  .all_stat_container_wrappper {
    position: relative;
    width: 100%;
    height: auto;
    max-height: max(calc(100vh - 235px), 170px);
    overflow: auto;
    background: $background-2;
    @include scrollbar_light();

    &.has_btns {
      background: $background-1;
    }
  }

  .all_stat_container {
    margin: 20px auto;
    position: relative;
    opacity: 1;
    transition: opacity $transition-basic-1;
    &.loading {
      opacity: 0;
      transition: opacity 0s;
    }
  }

  .btns {
    text-align: left;
    padding: 4px 0;
    overflow-x: auto;
    white-space: nowrap;
    border-bottom: 1px solid $color-5;
    @include scrollbar_light();
    .button {
      margin: 5px;
      background: transparent;
      border-color: transparent;
      box-shadow: none;
      height: 0;
      padding: 10px 20px;
      font-weight: 600;
      :global(.icon) {
        margin-left: 0;
        margin-right: 10px;
      }
      &:hover {
        text-shadow: 0 0 10px $color-4;
      }
    }
  }

  :global(html.rounded_design) {
    .main_wrapper{
      overflow: hidden;
      border-bottom-right-radius: $rounded;
    }
    .all_stat_container_wrappper {
      // border-radius: $rounded;
      border-bottom-left-radius: $rounded;
      &:not(.has_btns) {
        border-radius: $rounded;
      }
    }
  }

  :global(html.page_shadow_colored .box_shadow.box_shadow_color) {
    .btns .button {
      @each $entity in $entities {
        &.selected.shadow_#{$entity} {
          text-shadow: 0 0 10px #{color($entity)};
        }
      }
    }
  }
</style>
