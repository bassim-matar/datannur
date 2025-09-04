<script lang="ts">
  import Switch from "@layout/Switch.svelte"
  import Options from "@lib/Options"

  let { on_change = value => {} } = $props()

  let evolution_summary = $state(Options.get("evolution_summary"))

  function update_evolution_summary() {
    Options.set("evolution_summary", evolution_summary, () => {
      on_change("evolution_summary" + String(evolution_summary))
    })
  }
</script>

<div
  class="evolution_summary_wrapper use_tooltip"
  title="Afficher les évolultions de façon résumée"
>
  <Switch
    bind:value={evolution_summary}
    change={update_evolution_summary}
    slot_position="left"
    tree_switch={true}
    minimize={true}
    size="small"
  ></Switch>
</div>

<style lang="scss">
  .evolution_summary_wrapper {
    position: absolute;
    top: 135px;
    right: 0px;
    z-index: 2;
  }
  @media screen and (max-width: 600px) {
    .evolution_summary_wrapper {
      top: 40px;
      left: 5px;
      right: auto;
    }
  }
</style>
