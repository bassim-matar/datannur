<script>
  import { locale } from "@js/constant"

  export let number

  $: formattedNumber = number?.toLocaleString(locale)
</script>

<span>{formattedNumber}</span>

<style>
  span {
    font-variant-numeric: tabular-nums;
  }
</style>
