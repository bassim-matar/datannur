<script lang="ts">
  let { title, description = title }: { title: string; description?: string } =
    $props()
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>
