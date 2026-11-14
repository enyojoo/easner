"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type FilterTab<T extends string = string> = {
  value: T
  label: string
  /** Count in a 20-high muted pill. */
  count?: number
  /** Full meaning for screen readers ("Money in"). */
  ariaLabel?: string
}

type FilterTabsProps<T extends string = string> = {
  tabs: ReadonlyArray<FilterTab<T>>
  value: T
  onChange: (value: T) => void
  /** Pointer enters or focus lands on a tab: warm whatever it will show. */
  onTabHover?: (value: T) => void
  /** underline: page filters. pills: a compact set inside a toolbar. */
  variant?: "underline" | "pills"
  /** Names the tablist ("Filter users"). */
  ariaLabel: string
  className?: string
}

/** A tablist of buttons with aria-selected and a visible focus ring. */
export function FilterTabs<T extends string = string>({
  tabs,
  value,
  onChange,
  onTabHover,
  variant = "underline",
  ariaLabel,
  className,
}: FilterTabsProps<T>) {
  const listRef = React.useRef<HTMLDivElement>(null)

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])
    const index = buttons.findIndex((button) => button === document.activeElement)
    if (index < 0) return
    event.preventDefault()
    const next = buttons[(index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length]
    next?.focus()
    next?.click()
  }

  const pills = variant === "pills"

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        pills ? "inline-flex items-center gap-1 rounded-full bg-muted p-1" : "flex items-center gap-6 border-b border-border/60",
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={tab.ariaLabel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onPointerEnter={onTabHover ? () => onTabHover(tab.value) : undefined}
            onFocus={onTabHover ? () => onTabHover(tab.value) : undefined}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              pills
                ? cn(
                    "h-8 rounded-full px-3.5",
                    selected ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )
                : cn(
                    "-mb-px h-11 border-b-2 px-0.5",
                    selected
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  ),
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
