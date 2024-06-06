<script>
  import { reset_cols_search_cache } from "@js/util"
  import { url_param } from "@js/url_param"
  import Icon from "@layout/Icon.svelte"
  import Switch from "@layout/Switch.svelte"
  import Options from "@js/Options"
  
  export let on_change = (value) => {}

  let open_all_recursive = Options.get("open_all_recursive")
  
  function update_open_all_recursive() {
    Options.set("open_all_recursive", open_all_recursive, () => {
      on_change(open_all_recursive)
      reset_cols_search_cache()
      url_param.reset()
    })
  }
</script>

<div class="open_all_wrapper" title="Afficher les éléments imbriqués">
  <Switch
    bind:value={open_all_recursive}
    change={update_open_all_recursive}
    slot_position="left"
  >
    <Icon type="folder_tree" />
  </Switch>
</div>

<style lang="scss">
  .open_all_wrapper {
    position: absolute;
    top: 75px;
    right: 45px;
  }
  @media screen and (max-width: 600px) {
    .open_all_wrapper {
      right: 10px;
    }
  }
</style>