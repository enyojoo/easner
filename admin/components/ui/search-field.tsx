"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

type SearchFieldProps = Omit<React.ComponentProps<"input">, "type" | "onChange" | "value"> & {
  value: string
  onChange: (value: string) => void
  /** Called by the clear button and Escape. Defaults to onChange(""). */
  onClear?: () => void
  /** Say what is searched: "Search users". It is also the accessible name. */
  placeholder: string
  /** Wrapper class: toolbars use w-60 (240), pickers and sheets full width. */
  className?: string
}

/** The one search input: a 36 pill with a search icon and a clear button while it has a value. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { value, onChange, onClear, placeholder, className, onKeyDown, ...props },
  ref,
) {
  const clear = () => (onClear ? onClear() : onChange(""))
  return (
    <div
      data-slot="search-field"
      className={cn(
        "relative flex h-9 w-60 items-center rounded-full border border-input bg-card transition-[border-color,box-shadow]",
        "hover:border-foreground/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden />
      <input
        ref={ref}
        type="search"
        data-search-field
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.key === "Escape" && value) {
            event.stopPropagation()
            clear()
          }
        }}
        className="h-full w-full rounded-full bg-transparent pl-9 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  )
})
