import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
}

export function sanitizeHtmlWithSvg(html: string): string {
  if (!html) return ''

  const foreignObjectRegex = /(<foreignObject[^>]*>)(.*?)(<\/foreignObject>)/gis
  const foreignObjects: string[] = []

  const processedHtml = html.replace(
    foreignObjectRegex,
    (match, opening, content, closing) => {
      const index = foreignObjects.length
      foreignObjects.push(content)
      return `${opening}PRESERVED_FOREIGN_OBJECT_${index}${closing}`
    },
  )

  const sanitizedHtml = DOMPurify.sanitize(processedHtml, {
    ADD_TAGS: [
      'foreignObject',
      'svg',
      'g',
      'path',
      'rect',
      'text',
      'circle',
      'line',
    ],
    ADD_ATTR: [
      'xmlns',
      'viewBox',
      'width',
      'height',
      'x',
      'y',
      'fill',
      'stroke',
      'd',
      'transform',
    ],
  })

  return sanitizedHtml.replace(
    /PRESERVED_FOREIGN_OBJECT_(\d+)/g,
    (match, index) => {
      const content = foreignObjects[parseInt(index)] ?? ''
      return DOMPurify.sanitize(content, {
        ADD_TAGS: ['div', 'span', 'p', 'i', 'strong', 'br'],
        ADD_ATTR: ['class', 'style', 'xmlns'],
      })
    },
  )
}

let globalListenerAttached = false

function attachGlobalListener() {
  if (globalListenerAttached) return

  document.addEventListener('click', event => {
    const target = event.target as Element
    const link = target.closest('a.internal-link')

    if (link) {
      const href = link.getAttribute('data-href')
      if (href && window.goToHref) {
        window.goToHref(event as MouseEvent, href)
      }
    }
  })

  globalListenerAttached = true
}

export function safeHtml(node: HTMLElement, html: string) {
  attachGlobalListener()

  function update(newHtml: string) {
    node.innerHTML = sanitizeHtml(newHtml ?? '')
  }

  update(html)
  return { update }
}

export function safeHtmlWithSvg(node: HTMLElement, html: string) {
  attachGlobalListener()

  function update(newHtml: string) {
    node.innerHTML = sanitizeHtmlWithSvg(newHtml ?? '')
  }

  update(html)
  return { update }
}
