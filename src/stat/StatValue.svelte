<script>
  import { get_percent } from "@js/util"
  import { extendable } from "@js/extendable"
  import { locale } from "@js/constant"

  export let value
  export let total_value
  export let main_color
  export let with_html = false

  const percent = get_percent(value.count / total_value)
</script>

<div class="value_box">
  <div class="value_text">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="cell readable extendable"
      on:mouseenter={extendable.open}
      on:mouseleave={extendable.close}
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
  />
</div>

<style lang="scss">
  @import "../main.scss";

  .value_box {
    position: relative;
    padding: 5px 10px;
    width: 100%;
    text-align: right;
    .percent_background {
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      opacity: 0.3;
      pointer-events: none;
    }
    .value_text {
      position: relative;
      z-index: 2;
      .cell {
        display: inline-block;
        vertical-align: top;
        &.readable {
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
