import Logs from "@lib/Logs"

function apply_to_elements(selector, apply) {
  document.querySelectorAll(selector).forEach(apply)
}

export default class Exporter {
  id: string
  constructor(id: string) {
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
    const filename = this.id
    return [
      {
        text: '<span class="icon icon_download main"><i class="fas fa-cloud-download-alt"></i></span>',
        action: () => this.toggle_main_btn(),
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-copy"></i></span>copie',
        className: "download_button",
        extend: "copy",
        title: "",
        exportOptions: { orthogonal: "export" },
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-file-csv"></i></span>csv',
        className: "download_button",
        extend: "csvHtml5",
        fieldSeparator: ";",
        extension: ".csv",
        filename,
        bom: true,
        exportOptions: { orthogonal: "export" },
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-file-excel"></i></span>excel',
        className: "download_button",
        extend: "excel",
        filename,
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
      main_btn.setAttribute("is_open", "false")
      Logs.add("close_table_download")
    } else {
      apply_to_elements(btns, element => element.classList.add("open"))
      main_btn.setAttribute("is_open", "true")
      Logs.add("open_table_download")
    }
  }
}
