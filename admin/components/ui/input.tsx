import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-12 w-full rounded-md border border-input hover:border-muted-foreground bg-background px-4 text-[15px]",
          "placeholder:text-muted-foreground",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--foreground)_2%,transparent)]",
          "transition-[border-color,box-shadow,background-color] duration-150",
          "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0",
          "read-only:cursor-default read-only:border-border/60 read-only:bg-muted/60 read-only:text-muted-foreground read-only:hover:border-border/60 read-only:focus-visible:ring-0 read-only:focus-visible:border-border/60",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-muted/60 disabled:text-muted-foreground disabled:opacity-100",
          "caret-primary md:text-sm",
          "aria-invalid:border-destructive-text aria-invalid:ring-destructive/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
