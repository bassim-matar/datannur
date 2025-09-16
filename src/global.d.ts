declare module '*.png' {
  const value: string
  export default value
}
declare module '*.md?raw' {
  const value: string
  export default value
}
declare module '*.json' {
  const value: unknown
  export default value
}

interface Window {
  _current_tab_data: unknown
  FlexSearch: unknown
  __global_timer: number
  mermaid: unknown
  goToHref: (event: MouseEvent, href: string) => void
}
