
declare module "*.png" {
  const value: string
  export default value
}
declare module "*.md?raw" {
  const value: string
  export default value
}
declare module "*.json" {
  const value: any
  export default value
}

interface Window {
  _current_tab_data: any
  FlexSearch: any
  __global_timer: number
  mermaid: any
  go_to_href: (event: MouseEvent, href: string) => void
}
