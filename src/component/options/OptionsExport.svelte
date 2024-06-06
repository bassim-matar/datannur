<script>
  import JSZip from "jszip"
  import { saveAs } from "file-saver"
  import db from "@db"

  function download_all_files() {
    const user_files_key = "user_files/"
    const jszip = new JSZip()
    const files = jszip.folder("files")
    db.browser.getAll(user_files_key, entries => {
      console.log(entries)
      for (const entry of entries) {
        const filename = entry.k
        const file = entry.v
        console.log(entry)
        if (!(file instanceof File)) continue
        files.file(filename, file, { binary: true })
      }
      jszip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, "datannuaire_files.zip")
      })
    })
  }
</script>

<div class="flex_cols">
  <div class="flex_col">
    <button class="button" on:click={() => window.open("zip/datannuaire.zip")}
      >L'application datannuaire</button
    >
    <button
      class="button"
      on:click={() => window.open("zip/datannuaire_db.zip")}
      >La base de données Excel</button
    >
    <button class="button" on:click={download_all_files}
      >Mes fichiers chargés</button
    >
  </div>
</div>
