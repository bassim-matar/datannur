<script lang="ts">
  import db from '@db'

  let result = $state('Loading...')
  db.checkIntegrity().then(res => (result = JSON.stringify(res, null, 2)))
  console.log(db)
</script>

<section class="section">
  <h1 class="title">DB Integrity Check</h1>
  <div id="result" style="white-space: pre-wrap">
    {result}
  </div>
</section>

<style lang="scss">
  @use 'main.scss' as *;

  section .title {
    color: $color-3;
  }
</style>
