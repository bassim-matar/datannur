import Logs from '@lib/logs'

function applyToElements(selector, apply) {
  document.querySelectorAll(selector).forEach(apply)
}

export default class Exporter {
  id: string
  constructor(id: string) {
    this.id = id
  }
  getLanguage() {
    return {
      copyTitle: 'Copier dans le presse-papier',
      copySuccess: 'Tableau copié dans le presse-papier',
    }
  }
  getButtons() {
    const filename = this.id
    return [
      {
        text: '<span class="icon icon_download main"><i class="fas fa-cloud-download-alt"></i></span>',
        action: () => this.toggleMainBtn(),
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-copy"></i></span>copie',
        className: 'download_button',
        extend: 'copy',
        title: '',
        exportOptions: { orthogonal: 'export' },
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-file-csv"></i></span>csv',
        className: 'download_button',
        extend: 'csvHtml5',
        fieldSeparator: ';',
        extension: '.csv',
        filename,
        bom: true,
        exportOptions: { orthogonal: 'export' },
        footer: false,
      },
      {
        text: '<span class="icon icon_download"><i class="fas fa-file-excel"></i></span>excel',
        className: 'download_button',
        extend: 'excel',
        filename,
        title: '',
        exportOptions: { orthogonal: 'export' },
        footer: false,
      },
    ]
  }
  toggleMainBtn() {
    const tableId = `#${this.id}_wrapper`
    const btns = `${tableId} .buttons-html5`
    const mainBtn = document.querySelector(`${tableId} .dt-buttons`)
    const isOpen = mainBtn.getAttribute('is-open')
    if (isOpen === 'true') {
      applyToElements(btns, element => element.classList.remove('open'))
      mainBtn.setAttribute('is-open', 'false')
      Logs.add('close_table_download')
    } else {
      applyToElements(btns, element => element.classList.add('open'))
      mainBtn.setAttribute('is-open', 'true')
      Logs.add('open_table_download')
    }
  }
}
