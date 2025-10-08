import 'datatables.net-bm'

declare module 'datatables.net-bm' {
  interface DataTablesStatic {
    ['Buttons']: {
      jszip: (jszip: unknown) => void
    }
  }
}
