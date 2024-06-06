<script>
  import { onDestroy } from "svelte"

  let props = $$restProps

  export let type = "classic"
  export let position = "fixed"
  export let color_entity = ""

  let with_height = false
  let with_timer = true

  let timer = ""
  let loading_timer = setInterval(() => {
    if (timer === "") timer = 0
    timer += 1
  }, 1000)

  onDestroy(() => clearInterval(loading_timer))

  if (type === "tab_body") {
    position = "absolute"
    with_height = true
  } else if (type === "mini") {
    with_timer = false
  } else if (type === "tab") {
    with_timer = false
    position = "absolute"
  }
</script>

{#if with_height}
  <div style="height: 250px;"></div>
{/if}

<div
  class="loading {type} color_entity_{color_entity}"
  style="position: {position};"
>
  <div class="inner one" />
  <div class="inner two" />
  <div class="inner three" />
  {#if with_timer}
    <div class="timer">{timer}</div>
  {/if}
</div>

<style lang="scss">
  @import "../main.scss";

  .loading {
    --loader-color: #{$color-3};
  }

  :global(html.page_shadow_colored) {
      .loading {
        @each $entity in $entities {
          &.color_entity_#{$entity} {
            --loader-color: #{color($entity)};
          }
        }
      }
    }

  .loading {
    top: calc(50% - 32px);
    left: calc(50% - 32px);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    perspective: 800px;
    &.mini {
      display: inline-block;
      top: auto;
      left: auto;
      width: 16px;
      height: 16px;
      margin-bottom: -3px;
      margin-left: -5px;
    }
    &.tab {
      display: inline-block;
      top: 12px;
      left: auto;
      width: 16px;
      height: 16px;
      margin-left: 4px;
    }
    .timer {
      padding-top: 16px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: var(--loader-color);
    }
  }
  .inner {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  .inner.one {
    left: 0%;
    top: 0%;
    animation: rotate-one 1s linear infinite;
    border-bottom: 3px solid var(--loader-color);
  }
  .inner.two {
    right: 0%;
    top: 0%;
    animation: rotate-two 1s linear infinite;
    border-right: 3px solid var(--loader-color);
  }
  .inner.three {
    right: 0%;
    bottom: 0%;
    animation: rotate-three 1s linear infinite;
    border-top: 3px solid var(--loader-color);
  }
  @keyframes rotate-one {
    0% {
      transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
    }
    100% {
      transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
    }
  }
  @keyframes rotate-two {
    0% {
      transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
    }
    100% {
      transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
    }
  }
  @keyframes rotate-three {
    0% {
      transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
    }
    100% {
      transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
    }
  }
</style>
