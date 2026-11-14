import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1 w-fit whitespace-nowrap shrink-0 overflow-hidden",
    "rounded-full border px-3 py-1 text-xs font-medium",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "transition-[color,background-color,border-color] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ].join(" "),
  {
    variants: {
      variant: {
        neutral:
          "bg-muted text-foreground border-transparent",
        emerald:
          "bg-success-surface text-success-text border-transparent",
        amber:
          "bg-warning-surface text-warning-text border-transparent",
        oxblood:
          "bg-destructive-surface text-destructive-text border-transparent",
        slate:
          "bg-muted text-muted-foreground border-transparent",
        outline:
          "bg-transparent text-foreground border-border",
        solid:
          "bg-foreground text-background border-transparent",

        success: "bg-success-surface text-success-text border-transparent",
        warning: "bg-warning-surface text-warning-text border-transparent",
        info: "bg-info-surface text-info-text border-transparent",

        default: "bg-info-surface text-primary-text border-transparent",
        secondary: "bg-muted text-muted-foreground border-transparent",
        destructive: "bg-destructive-surface text-destructive-text border-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
