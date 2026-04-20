"use client"

import * as React from "react"
import { flexRender, Table as TanstackTable } from "@tanstack/react-table"
import { cx } from "@/lib/utils"

/**
 * P2-21: Mobile card-list fallback for <DataTable>. Below `lg` (1024px) the
 * horizontal-scroll table is replaced with stacked cards per row. Preserves
 * row-click toggle semantics so selection works the same as desktop.
 */
export function DataTableMobileCards<TData>({
  table,
}: {
  table: TanstackTable<TData>
}) {
  const rows = table.getRowModel().rows

  if (!rows.length) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-6 text-center text-sm text-[color:var(--text-tertiary)]">
        No results.
      </div>
    )
  }

  return (
    <ul role="list" className="space-y-2">
      {rows.map((row) => {
        const cells = row.getVisibleCells()
        return (
          <li key={row.id}>
            <div
              role="button"
              tabIndex={0}
              aria-pressed={row.getIsSelected()}
              onClick={() => row.toggleSelected(!row.getIsSelected())}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  row.toggleSelected(!row.getIsSelected())
                }
              }}
              className={cx(
                "relative block w-full cursor-pointer select-none rounded-[var(--radius-lg)] border p-4 text-left transition-colors min-h-[56px]",
                row.getIsSelected()
                  ? "border-brand-500 bg-[color:var(--bg-elevated)]"
                  : "border-[color:var(--border-default)] bg-[color:var(--bg-surface)] hover:bg-[color:var(--bg-elevated)]",
              )}
            >
              {row.getIsSelected() && (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 rounded-l-[var(--radius-lg)] bg-brand-500 dark:bg-brand-400"
                />
              )}
              <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-x-3 gap-y-2 text-sm">
                {cells.map((cell) => {
                  const label = cell.column.columnDef.meta?.displayName
                  if (!label) return null
                  return (
                    <React.Fragment key={cell.id}>
                      <dt className="text-[12px] font-medium uppercase tracking-wide text-[color:var(--text-tertiary)]">
                        {label}
                      </dt>
                      <dd className="min-w-0 text-[color:var(--text-primary)]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </dd>
                    </React.Fragment>
                  )
                })}
              </dl>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
