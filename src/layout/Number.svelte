<script lang="ts">
  import { locale } from "@js/constant"

  let { number } = $props()

  let formattedNumber = $derived(number?.toLocaleString(locale))
</script>

<span>{formattedNumber}</span>

<style>
  span {
    font-variant-numeric: tabular-nums;
  }
</style>
