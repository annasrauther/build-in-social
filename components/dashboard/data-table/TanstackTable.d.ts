import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  // Module augmentation — generic params must match the library signature even if unused here.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    displayName: string
  }
}
