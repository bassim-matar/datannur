<script lang="ts">
  import { locale } from '@lib/constant'

  let { number }: { number: number } = $props()

  let formattedNumber = $derived(number?.toLocaleString(locale))
</script>

<span>{formattedNumber}</span>

<style>
  span {
    font-variant-numeric: tabular-nums;
  }
</style>
