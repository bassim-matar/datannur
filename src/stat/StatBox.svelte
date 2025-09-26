<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import { getColor } from '@lib/util'
  import { entityNames } from '@lib/constant'
  import StatValue from './StatValue.svelte'

  let { entity, attribut, withHtml = false, fromPopup = false } = $props()

  const totalValue = attribut.totalValue
  const mainColor = getColor(entity)
</script>

<div
  class="stat_box box_shadow box_shadow_color shadow_{entity}"
  class:from-popup={fromPopup}
  style="background: {mainColor}44;"
>
  <h2 class="title is-6">
    <Icon type={entity} />
    {entityNames[entity]}
    <span class="separator"></span>
    <Icon type={attribut.icon || attribut.key} />
    {attribut.name}
  </h2>
  <div class="values_wrapper">
    <div class="values">
      {#each attribut.values as value, i (i)}
        <StatValue {value} {totalValue} {mainColor} {withHtml} />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  @use 'main.scss' as *;
  @use '../style/icon.scss' as *;

  .stat_box {
    :global {
      @include icon_color;
    }
  }

  .stat_box {
    position: absolute;
    min-height: 0;
    margin-bottom: 0;
    box-sizing: border-box;
    border-radius: 4px;
    overflow: hidden;
    &.from-popup {
      position: relative;
    }
    :global(html.rounded_design) & {
      border-radius: $rounded;
    }
    .title {
      display: inline-block;
      text-align: center;
      width: 100%;
      margin: auto;
      line-height: 1.5;
      padding: 10px;
      .separator {
        margin: 0 5px;
      }
    }
    .values {
      overflow: auto;
      max-height: 400px;
      @include scrollbar_light();
    }
  }

  :global(html.page_shadow_colored .box_shadow.box_shadow_color) {
    .stat_box {
      @each $entity in $entities {
        &.shadow_#{$entity} {
          border: 1px solid #{color($entity)};
        }
      }
    }
  }
</style>
