import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[112px] w-full rounded-md border border-input hover:border-muted-foreground bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive-text aria-invalid:ring-destructive/30 read-only:border-border/60 read-only:bg-muted/60 read-only:text-muted-foreground read-only:hover:border-border/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-muted/60 disabled:text-muted-foreground disabled:opacity-100 md:text-sm transition-[border-color]",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
