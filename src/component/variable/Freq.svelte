<script lang="ts">
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'
  import { getPercent } from '@lib/util'
  import escapeHtml from 'escape-html'

  let { freq } = $props()

  const freqSorted = [...freq].sort((a, b) => (b.freq || 0) - (a.freq || 0))
  const totalFreq = freq.reduce((sum, item) => sum + (item.freq || 0), 0)
  const maxFreq = freqSorted.length > 0 ? freqSorted[0].freq : 1

  function defineColumns() {
    const columns = []

    columns.push({
      data: 'value',
      title: Render.icon('value') + 'Valeur',
      tooltip: 'Valeur de la variable',
      render: Render.longText,
    })

    columns.push({
      data: 'freq',
      title: Render.icon('freq') + 'Fréquence',
      tooltip: "Nombre d'occurrences avec pourcentage",
      filterType: 'input',
      className: 'text-right',
      render: (data, type) => {
        if (data === null || data === undefined || !totalFreq) return ''
        const percentDisplay = getPercent(data / totalFreq)
        const percentBackground = getPercent(data / maxFreq)
        if (type === 'display') {
          const freqNum = Render.num(data, type)
          return `
          <div class="freq-item-container">
            <div class="freq-background color-freq" style="width: ${percentBackground}%"></div>
            <span class="freq-number">${escapeHtml(freqNum)}</span>
            <span class="freq-percent">${percentDisplay}%</span>
          </div>`
        }

        return Render.numPercent(data, percentDisplay, 'freq', type, true)
      },
    })

    return columns
  }

  const columns = defineColumns()
</script>

<Datatable entity="freq" data={freqSorted} {columns} keepAllCols={true} />
