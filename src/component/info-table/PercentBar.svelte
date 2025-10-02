<script lang="ts">
  import { getPercent } from '@lib/util'
  import Render from '@lib/render'

  let { value, nbRow, type, percent = getPercent(value / nbRow) } = $props()
</script>

<span class="num-percent color-{type} placeholder" style="width: 100%"></span>
<div class="filled-container">
  <div class="num-percent-filled color-{type}" style="width: {percent}%"></div>
</div>
<span class="value">{Render.num(value)} ({percent}%)</span>

<style lang="scss">
  @use 'main.scss' as *;

  .value {
    position: relative;
  }

  .num-percent-value {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
  .filled-container {
    position: absolute;
    top: 10px;
    left: 0;
    bottom: 10px;
    width: 100%;
    border-radius: $rounded;
    overflow: hidden;
  }

  .num-percent,
  .num-percent-filled {
    opacity: 0.3;
    &.color-missing {
      background: color('missing');
    }
    &.color-duplicate {
      background: color('duplicate');
    }
    &.color-value {
      background: color('value');
    }
  }

  .num-percent {
    position: absolute;
    top: 10px;
    left: 0;
    bottom: 10px;
    border-radius: $rounded;
    &.placeholder {
      opacity: 0.1;
    }
  }

  .num-percent-filled {
    height: 100%;
  }
</style>
