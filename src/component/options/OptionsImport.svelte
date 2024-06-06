<script>
  import db from "@db"
  import BtnImport from "@layout/BtnImport.svelte"

  function import_file(file, filename) {
    const user_files_key = "user_files/"
    db.browser.set(user_files_key + filename, file)
  }
</script>

<div class="flex_cols">
  <div class="flex_col">
    <BtnImport on_import={import_file}>Un fichier</BtnImport>
  </div>
</div>
