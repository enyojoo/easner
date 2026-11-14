"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface EditorSelectOption {
  value: string
  label: string
}

/**
 * The editor's dropdown: compact (36px), square-ish corners, on the card surface. One component so every selector in
 * the editor (category, product page, product card) looks and behaves the same.
 */
export function EditorSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  placeholder,
  disabled,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  options: EditorSelectOption[]
  ariaLabel: string
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("h-9 rounded-lg border-border bg-card px-3 text-sm shadow-xs hover:bg-muted/40", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
