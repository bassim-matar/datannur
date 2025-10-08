import type { Mermaid } from 'mermaid'
import type { Flexsearch } from 'flexsearch'

declare global {
  interface Window {
    FlexSearch: Flexsearch
    mermaid: Mermaid
    goToHref: (event: MouseEvent, href: string) => void
  }

  const __APP_VERSION__: string
}
