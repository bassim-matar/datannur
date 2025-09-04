<script>
  import { get_percent } from "@js/util"
  import { extendable } from "@js/extendable"
  import { locale } from "@js/constant"

  let { value, total_value, main_color, with_html = false } = $props()

  const percent = get_percent(value.count / total_value)
</script>

<div class="value_box">
  <div class="value_text">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="cell readable extendable"
      onmouseenter={extendable.open}
      onmouseleave={extendable.close_one_line}
    >
      {#if with_html}
        {@html value.readable}
      {:else}
        {value.readable}
      {/if}
    </div>
    <div class="cell count">{value.count?.toLocaleString(locale)}</div>
    <div class="cell percent">{percent}%</div>
  </div>
  <div
    class="percent_background"
    style="width: {percent}%; background: {main_color};"
  ></div>
</div>

<style lang="scss">
  @use "main.scss" as *;

  .value_box {
    position: relative;
    padding: 5px 10px;
    width: 100%;
    text-align: right;
    .percent_background {
      position: absolute;
      top: 10px;
      left: 0;
      bottom: 10px;
      z-index: 0;
      opacity: 0.5;
      border-radius: $rounded;
      pointer-events: none;
    }
    .value_text {
      position: relative;
      z-index: 2;
      .cell {
        display: inline-block;
        vertical-align: top;
        &.readable {
          text-align: left;
          max-width: calc(100% - 120px);
        }
        &.count {
          min-width: 50px;
        }
        &.percent {
          min-width: 60px;
        }
      }
    }
  }

  .extendable {
    width: auto;
    max-height: 25px;
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: min(600px, calc(100vw - 220px));
    &:global(.open) {
      white-space: pre-wrap;
    }
  }
</style>
