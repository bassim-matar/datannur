<script lang="ts">
  import Switch from '@layout/Switch.svelte'
  import Options from '@lib/options'

  let { onChange = () => {} } = $props()

  let openAllRecursive = $state(Options.get('openAllRecursive'))

  function updateOpenAllRecursive() {
    Options.set('openAllRecursive', openAllRecursive, () => {
      onChange(openAllRecursive)
    })
  }
</script>

<div
  class="open-all-wrapper use-tooltip"
  title="Afficher les éléments imbriqués"
>
  <Switch
    bind:value={openAllRecursive}
    change={updateOpenAllRecursive}
    slotPosition="left"
    treeSwitch={true}
    size="small"
  ></Switch>
</div>

<style lang="scss">
  .open-all-wrapper {
    position: absolute;
    top: 135px;
    right: 0px;
    z-index: 2;
  }
  @media screen and (max-width: 600px) {
    .open-all-wrapper {
      top: 40px;
      left: 5px;
      right: auto;
    }
  }
</style>
