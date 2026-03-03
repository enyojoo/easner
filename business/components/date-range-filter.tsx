"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export type TimePeriod = "all" | "7d" | "30d" | "90d" | "1y" | "custom"

interface DateRangeFilterProps {
  timePeriod: TimePeriod
  customDateRange: { from: Date | undefined; to: Date | undefined }
  onTimePeriodChange: (period: TimePeriod) => void
  onCustomDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

export function DateRangeFilter({
  timePeriod,
  customDateRange,
  onTimePeriodChange,
  onCustomDateRangeChange,
}: DateRangeFilterProps) {
  const [tempDateRange, setTempDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [showCustomCalendar, setShowCustomCalendar] = useState(false)

  const getPeriodLabel = () => {
    if (timePeriod === "custom" && customDateRange.from && customDateRange.to) {
      return `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d")}`
    }
    const labels: Record<TimePeriod, string> = { 
      all: "All time", 
      "7d": "7 days", 
      "30d": "30 days", 
      "90d": "90 days", 
      "1y": "1 year",
      custom: "Custom range"
    }
    return labels[timePeriod] || "Select period"
  }

  const handleApplyCustomRange = () => {
    if (tempDateRange.from && tempDateRange.to) {
      onCustomDateRangeChange(tempDateRange)
      onTimePeriodChange("custom")
      setCalendarOpen(false)
      setShowCustomCalendar(false)
    }
  }

  const handleCancelCustomRange = () => {
    setTempDateRange({ from: undefined, to: undefined })
    setShowCustomCalendar(false)
  }

  const handlePresetClick = (period: TimePeriod) => {
    onTimePeriodChange(period)
    onCustomDateRangeChange({ from: undefined, to: undefined })
    setTempDateRange({ from: undefined, to: undefined })
    setCalendarOpen(false)
    setShowCustomCalendar(false)
  }

  const handleCustomRangeClick = () => {
    setShowCustomCalendar(true)
  }

  const handleOpenChange = (open: boolean) => {
    setCalendarOpen(open)
    if (!open) {
      setShowCustomCalendar(false)
    }
  }

  return (
    <Popover open={calendarOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent">
          <CalendarIcon className="h-3 w-3" />
          <span className="text-xs">{getPeriodLabel()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 max-w-[calc(100vw-2rem)]"
        align="end"
        side="bottom"
        sideOffset={4}
        alignOffset={-8}
        collisionPadding={16}
      >
        {!showCustomCalendar ? (
          <div className="p-3">
            <div className="flex flex-col gap-2">
              <Button
                variant={timePeriod === "all" ? "secondary" : "outline"}
                size="sm"
                className="text-xs h-8 w-full"
                onClick={() => handlePresetClick("all")}
              >
                All
              </Button>
              <Button
                variant={timePeriod === "7d" ? "secondary" : "outline"}
                size="sm"
                className="text-xs h-8 w-full"
                onClick={() => handlePresetClick("7d")}
              >
                7 days
              </Button>
              <Button
                variant={timePeriod === "30d" ? "secondary" : "outline"}
                size="sm"
                className="text-xs h-8 w-full"
                onClick={() => handlePresetClick("30d")}
              >
                30 days
              </Button>
              <Button
                variant={timePeriod === "90d" ? "secondary" : "outline"}
                size="sm"
                className="text-xs h-8 w-full"
                onClick={() => handlePresetClick("90d")}
              >
                90 days
              </Button>
              <Button
                variant={timePeriod === "1y" ? "secondary" : "outline"}
                size="sm"
                className="text-xs h-8 w-full"
                onClick={() => handlePresetClick("1y")}
              >
                1 year
              </Button>
              <Button
                variant={timePeriod === "custom" ? "secondary" : "outline"}
                size="sm"
                className="text-xs h-8 w-full"
                onClick={handleCustomRangeClick}
              >
                Custom range
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <Calendar
              mode="range"
              selected={{ from: tempDateRange.from, to: tempDateRange.to }}
              onSelect={(range) => {
                setTempDateRange({ from: range?.from, to: range?.to })
              }}
              numberOfMonths={1}
              pagedNavigation
              showOutsideDays={false}
              fixedWeeks
              className="md:hidden"
            />
            <Calendar
              mode="range"
              selected={{ from: tempDateRange.from, to: tempDateRange.to }}
              onSelect={(range) => {
                setTempDateRange({ from: range?.from, to: range?.to })
              }}
              numberOfMonths={2}
              pagedNavigation
              showOutsideDays={false}
              fixedWeeks
              className="hidden md:block"
            />
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleCancelCustomRange}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleApplyCustomRange}
                disabled={!tempDateRange.from || !tempDateRange.to}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
