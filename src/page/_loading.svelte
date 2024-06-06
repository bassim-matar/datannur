<script>
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import logo from "@img/logo.png"
  import logo_dark from "@img/logo_dark.png"
  import Head from "@frame/Head.svelte"

  let props = $$restProps
  let title = "Chargement..."
  $: logo_src = $dark_mode_theme === "dark" ? logo_dark : logo
</script>

<Head {title} />
<img class="loading_logo" src={logo_src} alt="logo" />

<style lang="scss">
  img {
    position: fixed;
    top: calc(50% - 25px);
    left: calc(50% - 150px);
    height: 50px;
    max-width: 90vw;
  }
</style>
