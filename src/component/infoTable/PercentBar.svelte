<script>
  import { get_percent } from "@js/util"
  import Render from "@js/Render"

  export let value
  export let nb_row
  export let type

  export let percent = get_percent(value / nb_row)
</script>

<span>{Render.num(value)} ({percent}%)</span>
<span class="num_percent color_{type}" style="width: {percent}%"></span>

<style lang="scss">
  @use "../../main.scss" as *;

  .num_percent_value {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
  .num_percent {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    opacity: 0.2;
    &.color_missing {
      background: color("missing");
    }
    &.color_duplicate {
      background: color("duplicate");
    }
    &.color_value {
      background: color("value");
    }
  }
</style>
