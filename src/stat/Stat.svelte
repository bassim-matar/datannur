<script>
  import MiniMasonry from "minimasonry"
  import { onMount, onDestroy } from "svelte"
  import Icon from "@layout/Icon.svelte"
  import { document_width, get_color } from "@js/util"
  import { entity_names } from "@js/constant"
  import attributs from "./attributs"
  import { add_values } from "./stat"
  import StatBox from "./StatBox.svelte"

  let { stat } = $props()

  let show_all = $state(true)
  let visible = $state({})
  let loading = $state(false)

  let masonry

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

  const entities = stat.filter(x => x.items?.length > 0)
  entities.forEach(entity => {
    visible[entity.entity] = false
    entity.with_html = entity.entity === "log"
    entity.attributs = add_values(entity.items, attributs[entity.entity])
  })

  let has_btns = entities.length > 1
  let no_btns = !has_btns
</script>

{#if entities.length > 1}
  <div class="btns">
    <button
      class="button"
      class:box_shadow={show_all}
      class:box_shadow_color={show_all}
      style="color: {show_all ? get_color('entity') : ''}"
      onclick={click_show_all}
    >
      <Icon type="entity" />
      <span class="btn_select_entity_name">Tout</span>
    </button>
    {#each entities as { entity }}
      <button
        class="button shadow_{entity}"
        class:active={visible[entity]}
        class:box_shadow_color={visible[entity]}
        style="color: {visible[entity] ? get_color(entity) : ''}"
        onclick={() => show(entity)}
      >
        <Icon type={entity} />
        <span class="btn_select_entity_name">
          {entity_names[entity]}
        </span>
      </button>
    {/each}
  </div>
{/if}

<div class="main_wrapper">
  <div class="all_stat_container_wrappper" class:no_btns class:has_btns>
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
  @use "../main.scss" as *;

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
    @include scrollbar_light();
    .button {
      float: left;
      margin: 5px;
      background: transparent;
      border-color: transparent !important;
      box-shadow: none;
      height: 0;
      padding: 10px;
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
    .main_wrapper {
      overflow: hidden;
      border-bottom-right-radius: $rounded;
    }
    .all_stat_container_wrappper {
      border-bottom-left-radius: $rounded;
      &.no_btns {
        border-radius: $rounded;
      }
    }
  }

  :global(html.page_shadow_colored .box_shadow.box_shadow_color) {
    .btns .button {
      @each $entity in $entities {
        &.active.shadow_#{$entity} {
          text-shadow: 0 0 10px #{color($entity)};
        }
      }
    }
  }

  @media screen and (max-width: 600px) {
    .btns {
      padding-left: 10px;
      .button {
        padding-left: 0;
        padding-right: 0;
        margin-left: 0;
        margin-right: 0;
        .btn_select_entity_name {
          display: none;
        }
      }
    }
  }
</style>
