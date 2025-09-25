<script lang="ts">
  import { onMount } from 'svelte'
  import { footerVisible, pageContentLoaded } from '@lib/store'
  import Error from '@frame/Error.svelte'

  let { entity = 'page' } = $props()

  $footerVisible = true

  onMount(() => ($pageContentLoaded = true))
</script>

<Error type={entity} />
