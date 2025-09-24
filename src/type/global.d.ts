import type { Mermaid } from 'mermaid'
import type { Flexsearch } from 'flexsearch'

declare global {
  interface Window {
    __global_timer: number
    _current_tab_data: unknown
    FlexSearch: Flexsearch
    mermaid: Mermaid
    goToHref: (event: MouseEvent, href: string) => void
  }

  const __APP_VERSION__: string
}
