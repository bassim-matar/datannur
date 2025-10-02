<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import { getColor } from '@lib/util'
  import { entityNames } from '@lib/constant'
  import StatValue from './StatValue.svelte'

  let { entity, attribut, fromPopup = false } = $props()

  const totalValue = attribut.totalValue
  const mainColor = getColor(entity)
</script>

<div
  class="stat-box box-shadow box-shadow-color shadow-{entity}"
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
  <div class="values-wrapper">
    <div class="values">
      {#each attribut.values as value, i (i)}
        <StatValue {value} {totalValue} {mainColor} />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  @use 'main.scss' as *;
  @use '../style/icon.scss' as *;

  .stat-box {
    :global {
      @include icon-color;
    }
  }

  .stat-box {
    position: absolute;
    min-height: 0;
    margin-bottom: 0;
    box-sizing: border-box;
    border-radius: 4px;
    overflow: hidden;
    &.from-popup {
      position: relative;
    }
    :global(html.roundedDesign) & {
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
      @include scrollbar-light();
    }
  }

  :global(html.pageShadowColored .box-shadow.box-shadow-color) {
    .stat-box {
      @each $entity in $entities {
        &.shadow-#{$entity} {
          border: 1px solid #{color($entity)};
        }
      }
    }
  }
</style>
