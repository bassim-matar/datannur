<script lang="ts">
  import { darkModeTheme } from '@dark-mode/dark-mode'
  import logo from '@img/logo.png'
  import logo_dark from '@img/logo-dark.png'
  import Head from '@frame/Head.svelte'

  let title = 'Chargement...'
  let logoSrc = $derived($darkModeTheme === 'dark' ? logo_dark : logo)
</script>

<Head {title} />

<img class="loading_logo" src={logoSrc} alt="logo" />

<style lang="scss">
  .loading_logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 300px;
  }
</style>
