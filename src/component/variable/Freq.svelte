<script lang="ts">
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'
  import { getPercent, wrapLongText } from '@lib/util'

  let { freq } = $props()

  const freq_sorted = [...freq].sort((a, b) => (b.freq || 0) - (a.freq || 0))
  const totalFreq = freq.reduce((sum, item) => sum + (item.freq || 0), 0)
  const maxFreq = freq_sorted.length > 0 ? freq_sorted[0].freq : 1

  function defineColumns() {
    const columns = []

    columns.push({
      data: 'value',
      title: Render.icon('value') + 'Valeur',
      tooltip: 'Valeur de la variable',
      render: wrapLongText,
    })

    columns.push({
      data: 'freq',
      title: Render.icon('freq') + 'Fréquence',
      tooltip: "Nombre d'occurrences avec pourcentage",
      filter_type: 'input',
      className: 'text-right',
      render: (data, type, row) => {
        if (data === null || data === undefined || !totalFreq) return ''
        const percent_display = getPercent(data / totalFreq)
        const percent_background = getPercent(data / maxFreq)
        if (type === 'display') {
          const freq_num = Render.num(data, type)
          return `
          <div class="freq_item_container">
            <div class="freq_background color_freq" style="width: ${percent_background}%"></div>
            <span class="freq_number">${freq_num}</span>
            <span class="freq_percent">${percent_display}%</span>
          </div>`
        }

        return Render.numPercent(data, percent_display, 'freq', type, true)
      },
    })

    return columns
  }

  const columns = defineColumns()
</script>

<Datatable entity="freq" data={freq_sorted} {columns} keep_all_cols={true} />
