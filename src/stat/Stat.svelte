<script lang="ts">
  import MiniMasonry from 'minimasonry'
  import { onMount, onDestroy } from 'svelte'
  import Icon from '@layout/Icon.svelte'
  import { documentWidth, getColor } from '@lib/util'
  import { entityNames } from '@lib/constant'
  import { allTabs, onPageHomepage } from '@lib/store'
  import attributs from './attributs'
  import { addValues } from './stat'
  import StatBox from './StatBox.svelte'

  let { stat } = $props()

  let showAll = $state(true)
  let visible = $state({})
  let loading = $state(false)

  let masonry

  onMount(() => {
    masonry = new MiniMasonry({
      container: '.all_stat_container',
      baseWidth: Math.min(documentWidth - 20, 300),
      gutter: 20,
      ultimateGutter: 20,
    })
    updateLayout()
  })

  onDestroy(() => {
    masonry.destroy()
  })

  function updateNbItemVisible(entities) {
    let nbItemVisible = 0
    for (const entity of entities) {
      if (visible[entity.entity] || showAll) {
        nbItemVisible += entity.attributs.length
      }
    }
    $allTabs.stat.nb = nbItemVisible
  }

  function updateLayout() {
    updateNbItemVisible(entities)
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
    showAll = false
    updateLayout()
  }

  function clickShowAll() {
    for (const key in visible) {
      visible[key] = false
    }
    showAll = true
    updateLayout()
  }

  const entities = stat.filter(x => x.items?.length > 0)
  entities.forEach(entity => {
    visible[entity.entity] = false
    entity.attributs = addValues(entity.items, attributs[entity.entity])
  })

  let hasBtns = entities.length > 1
</script>

{#if entities.length > 1}
  <div class="btns">
    <button
      class="button"
      class:box_shadow={showAll}
      class:box_shadow_color={showAll}
      style="color: {showAll ? getColor('entity') : ''}"
      onclick={clickShowAll}
    >
      <Icon type="entity" />
      <span class="btn_select_entity_name">Tout</span>
    </button>
    {#each entities as entity (entity.entity)}
      <button
        class="button shadow_{entity.entity}"
        class:active={visible[entity.entity]}
        class:box_shadow_color={visible[entity.entity]}
        style="color: {visible[entity.entity] ? getColor(entity.entity) : ''}"
        onclick={() => show(entity.entity)}
      >
        <Icon type={entity.entity} />
        <span class="btn_select_entity_name">
          {entityNames[entity.entity]}
        </span>
      </button>
    {/each}
  </div>
{/if}

<div class="main_wrapper" class:homepage={$onPageHomepage}>
  <div
    class="all_stat_container_wrappper"
    class:no-btns={!hasBtns}
    class:has-btns={hasBtns}
  >
    <div class="all_stat_container" class:loading>
      {#each entities as entity (entity.entity)}
        {#if visible[entity.entity] || showAll}
          {#each entity.attributs as attribut (attribut.key)}
            <StatBox entity={entity.entity} {attribut} />
          {/each}
        {/if}
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .main_wrapper.homepage .all_stat_container_wrappper {
    max-height: max(calc(100vh - 270px), 80px);
  }

  .all_stat_container_wrappper {
    position: relative;
    width: 100%;
    height: auto;
    overflow: scroll;
    background: $background-2;
    @include scrollbar_light();

    &.has-btns {
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
      &.no-btns {
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

  @media screen and (max-width: $menu_mobile_limit) {
    .main_wrapper.homepage .all_stat_container_wrappper {
      max-height: max(calc(100vh - 250px), 80px);
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
