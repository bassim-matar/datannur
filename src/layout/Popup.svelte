<script>
  import { clickOutside } from "@js/util"
  import BtnClearInput from "@layout/BtnClearInput.svelte"

  let { is_open = $bindable(false), on_close = () => {}, children } = $props()

  function close_popup() {
    is_open = false
    on_close()
  }
</script>

{#if is_open}
  <div class="popup">
    <div class="popup-content" use:clickOutside onclick_outside={close_popup}>
      <div class="close-btn">
        <BtnClearInput click={close_popup} mode="normal" />
      </div>
      <div class="main_content">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "main.scss" as *;
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .popup-content {
    position: relative;
    background: $background-2;
    padding: 20px;
    border-radius: $rounded;
    text-align: center;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
    width: auto;
    height: auto;
    :global(html.dark_mode) & {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 1);
    }
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 0px;
  }

  .main_content {
    margin-top: 10px;
  }
</style>
