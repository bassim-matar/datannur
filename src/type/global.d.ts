import type { Mermaid } from 'mermaid'
import type Index from 'flexsearch'

declare global {
  interface Window {
    FlexSearch: typeof Index
    mermaid: Mermaid
    goToHref: (event: MouseEvent, href: string) => void
  }

  const __APP_VERSION__: string
}
