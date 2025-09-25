<script lang="ts">
  import { getPercent } from '@lib/util'
  import Render from '@lib/render'

  let { value, nb_row, type, percent = getPercent(value / nb_row) } = $props()
</script>

<span class="num_percent color_{type} placeholder" style="width: 100%"></span>
<div class="filled_container">
  <div class="num_percent_filled color_{type}" style="width: {percent}%"></div>
</div>
<span class="value">{Render.num(value)} ({percent}%)</span>

<style lang="scss">
  @use 'main.scss' as *;

  .value {
    position: relative;
  }

  .num_percent_value {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
  .filled_container {
    position: absolute;
    top: 10px;
    left: 0;
    bottom: 10px;
    width: 100%;
    border-radius: $rounded;
    overflow: hidden;
  }

  .num_percent,
  .num_percent_filled {
    opacity: 0.3;
    &.color_missing {
      background: color('missing');
    }
    &.color_duplicate {
      background: color('duplicate');
    }
    &.color_value {
      background: color('value');
    }
  }

  .num_percent {
    position: absolute;
    top: 10px;
    left: 0;
    bottom: 10px;
    border-radius: $rounded;
    &.placeholder {
      opacity: 0.1;
    }
  }

  .num_percent_filled {
    height: 100%;
  }
</style>
