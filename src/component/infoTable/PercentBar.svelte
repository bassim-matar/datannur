<script>
  import { get_percent } from "@js/util"
  import Render from "@js/Render"

  let { value, nb_row, type, percent = get_percent(value / nb_row) } = $props()
</script>

<span class="num_percent color_{type} placeholder" style="width: 100%"></span>
<span class="num_percent color_{type}" style="width: {percent}%"></span>
<span class="value">{Render.num(value)} ({percent}%)</span>

<style lang="scss">
  @use "../../main.scss" as *;

  .value {
    position: relative
  }

  .num_percent_value {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
  .num_percent {
    position: absolute;
    top: 10px;
    left: 0;
    bottom: 10px;
    border-radius: $rounded;
    opacity: 0.3;
    &.color_missing {
      background: color("missing");
    }
    &.color_duplicate {
      background: color("duplicate");
    }
    &.color_value {
      background: color("value");
    }
    &.placeholder {
      opacity: 0.1;
    }
  }
</style>
