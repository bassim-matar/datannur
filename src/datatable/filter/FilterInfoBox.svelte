<script>
  let { nb_active_filter = 0, click = () => {} } = $props()
</script>

{#if nb_active_filter > 0}
  <button class="filter_info_box" onclick={click}>
    {nb_active_filter} filtre{nb_active_filter > 1 ? "s" : ""}
    actif{nb_active_filter > 1 ? "s" : ""}
    <i class="close_btn fa-solid fa-xmark"></i>
  </button>
{/if}

<style lang="scss">
  @use "main.scss" as *;

  .filter_info_box {
    position: absolute;
    font-size: 12px;
    top: 35px;
    left: -45px;
    width: 40px;
    padding: 3px;
    text-align: center;
    line-height: 14px;
    font-style: italic;
    cursor: pointer;
    transition: $transition-basic-1;
    border: 1px solid transparent;
    background: transparent;
    .close_btn {
      opacity: 0;
      position: absolute;
      color: rgba(198, 105, 94, 0.5);
      font-size: 30px;
      top: 8px;
      left: 0;
      right: 0;
      z-index: 1;
      transition: $transition-basic-1;
    }
    :global(html.rounded_design) & {
      border-radius: 10px;
    }
    &:hover {
      border: 1px solid rgba(198, 105, 94, 1);
      background: rgba(198, 105, 94, 0.2);
      .close_btn {
        opacity: 1;
      }
    }
    @media screen and (max-width: 600px) {
      position: fixed;
      top: 5px;
      left: calc(50% - 20px);
      z-index: 50;
    }
  }
</style>
