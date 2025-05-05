"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  tabType: "volume" | "streak"
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tabType,
}: DataTableProps<TData, TValue>) {
  // Set initial sorting state based on the tab type
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: tabType === "volume" ? "volume" : "streak",
      desc: true
    }
  ])
  
  // Set initial column visibility based on tabType
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    volumeRank: tabType === "volume",
    streakRank: tabType === "streak",
    volume: tabType === "volume",
    streak: tabType === "streak"
  })

  // Update visibility and sorting when tabType changes
  React.useEffect(() => {
    setColumnVisibility({
      volumeRank: tabType === "volume",
      streakRank: tabType === "streak",
      volume: tabType === "volume",
      streak: tabType === "streak"
    })
    
    // Update sorting when tab changes
    setSorting([
      {
        id: tabType === "volume" ? "volume" : "streak",
        desc: true
      }
    ])
  }, [tabType])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}