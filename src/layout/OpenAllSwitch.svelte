<script lang="ts">
  import Switch from "@layout/Switch.svelte"
  import Options from "@lib/Options"

  let { on_change = value => {} } = $props()

  let open_all_recursive = $state(Options.get("open_all_recursive"))

  function update_open_all_recursive() {
    Options.set("open_all_recursive", open_all_recursive, () => {
      on_change(open_all_recursive)
    })
  }
</script>

<div
  class="open_all_wrapper use_tooltip"
  title="Afficher les éléments imbriqués"
>
  <Switch
    bind:value={open_all_recursive}
    change={update_open_all_recursive}
    slot_position="left"
    tree_switch={true}
    size="small"
  ></Switch>
</div>

<style lang="scss">
  .open_all_wrapper {
    position: absolute;
    top: 135px;
    right: 0px;
    z-index: 2;
  }
  @media screen and (max-width: 600px) {
    .open_all_wrapper {
      top: 40px;
      left: 5px;
      right: auto;
    }
  }
</style>
