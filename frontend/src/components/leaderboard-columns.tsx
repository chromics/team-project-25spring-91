"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "./ui/button"

export type Stats = {
  volumeRank: number
  streakRank: number
  username: string
  volume: number
  streak: number
}

export const columns: ColumnDef<Stats>[] = [
  {
    accessorKey: "volumeRank",
    header: "Rank",
    // This column will only be visible in the volume tab
  },
  {
    accessorKey: "streakRank",
    header: "Rank",
    // This column will only be visible in the streak tab
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "volume",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Volume
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
        return <div className="text-right">{row.getValue("volume")}</div>
    },
    // Only visible in volume tab
  },
  {
    accessorKey: "streak",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Streak
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
        return <div className="text-right">{row.getValue("streak")}</div>
    },
    // Only visible in streak tab
  },
]