import Logs from "@js/Logs.js"

function apply_to_elements(selector, apply) {
  document.querySelectorAll(selector).forEach(apply)
}

export default class Exporter {
  constructor(id) {
    this.id = id
  }
  get_language() {
    return {
      copyTitle: "Copier dans le presse-papier",
      copySuccess: {
        1: "1 ligne copiée dans le presse-papier",
        _: "%d lignes copiées dans le presse-papier",
      },
    }
  }
  get_buttons() {
    return [
      {
        text: '<span class="icon icon_download main"><i class="fas fa-cloud-download-alt"></i></span>',
        action: () => this.toggle_main_btn(),
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-copy"></i></span>copie',
        extend: "copy",
        title: "",
        exportOptions: { orthogonal: "export" },
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-file-csv"></i></span>csv',
        extend: "csvHtml5",
        fieldSeparator: ";",
        extension: ".csv",
        bom: true,
        exportOptions: { orthogonal: "export" },
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-file-excel"></i></span>excel',
        extend: "excel",
        title: "",
        exportOptions: { orthogonal: "export" },
        footer: false,
      },
    ]
  }
  toggle_main_btn() {
    const table_id = `#${this.id}_wrapper`
    const btns = `${table_id} .buttons-html5`
    const main_btn = document.querySelector(`${table_id} .dt-buttons`)
    const is_open = main_btn.getAttribute("is_open")
    if (is_open === "true") {
      apply_to_elements(btns, element => element.classList.remove("open"))
      main_btn.setAttribute("is_open", false)
      Logs.add("close_table_download")
    } else {
      apply_to_elements(btns, element => element.classList.add("open"))
      main_btn.setAttribute("is_open", true)
      Logs.add("open_table_download")
    }
  }
}
