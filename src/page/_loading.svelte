<script>
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import logo from "@img/logo.png"
  import logo_dark from "@img/logo_dark.png"
  import Head from "@frame/Head.svelte"

  let { ...rest } = $props()
  let title = "Chargement..."
  let logo_src = $derived($dark_mode_theme === "dark" ? logo_dark : logo)
</script>

<Head {title} />

<img class="loading_logo" src={logo_src} alt="logo" />

<style lang="scss">
  .loading_logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 300px;
  }
</style>
