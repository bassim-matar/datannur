<script>
  import db from "@db"

  let result = $state("Loading...")

  db.check_integrity().then(res => {
    console.log(db.db)
    window.datannur_db_check = db.db
    result = JSON.stringify(res, null, 2)
  })
</script>

<section class="section">
  <h1 class="title">DB Integrity Check</h1>
  <div id="result" style="white-space: pre-wrap">
    {result}
  </div>
</section>

<style lang="scss">
  @use "../main.scss" as *;

  section .title {
    color: $color-3;
  }
</style>
