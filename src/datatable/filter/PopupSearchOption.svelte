<script>
  import { clickOutside } from "@js/util"
  import BtnClearInput from "@layout/BtnClearInput.svelte"

  let { is_open = $bindable(false), on_close = () => {} } = $props()

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
        <h2 class="popup_title">Options de filtre des colonnes</h2>
        <table>
          <tbody>
            <tr>
              <td>...</td>
              <td>contient ...</td>
            </tr>
            <tr>
              <td>= ...</td>
              <td>est exactement égale à ...</td>
            </tr>
            <tr>
              <td>! ...</td>
              <td>ne contient pas ...</td>
            </tr>
            <tr>
              <td>&gt; ...</td>
              <td>Plus grand que ...</td>
            </tr>
            <tr>
              <td>&lt; ...</td>
              <td>Plus petit que ...</td>
            </tr>
            <tr>
              <td>!""</td>
              <td>ne contient pas de vide</td>
            </tr>
            <tr>
              <td>=""</td>
              <td>ne contient que du vide</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../../main.scss" as *;
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
    width: auto;
    height: auto;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 0px;
  }

  .main_content {
    margin-top: 10px;
    & table {
      width: 100%;
      border-collapse: collapse;
      & td {
        padding: 5px 10px;
        text-align: left;
        &:first-child {
          text-align: right;
        }
      }
    }
  }

  .popup_title {
    font-weight: bold;
    font-size: 18px;
  }
</style>
