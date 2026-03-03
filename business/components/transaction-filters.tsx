"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TransactionFiltersProps {
  typeFilter: string
  setTypeFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
}

export function TransactionFilters({
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}: TransactionFiltersProps) {
  return (
    <div className="flex gap-4">
      <div className="space-y-2 flex-1">
        <Label>Type</Label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="ach">ACH</SelectItem>
            <SelectItem value="wire">Wire</SelectItem>
            <SelectItem value="book">Book</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 flex-1">
        <Label>Status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
