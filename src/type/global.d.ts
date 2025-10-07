import type { Mermaid } from 'mermaid'
import type { Flexsearch } from 'flexsearch'
import JSZip from 'jszip'

declare global {
  interface Window {
    FlexSearch: Flexsearch
    JSZip: typeof JSZip
    mermaid: Mermaid
    goToHref: (event: MouseEvent, href: string) => void
  }

  const __APP_VERSION__: string
}
