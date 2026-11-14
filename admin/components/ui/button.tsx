import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/** Spinner + optional pending label for alert actions and other non-Button CTAs. */
export function ButtonPendingContent({
  pending = false,
  children,
  pendingLabel,
}: {
  pending?: boolean
  children: React.ReactNode
  pendingLabel?: React.ReactNode
}) {
  if (!pending) return <>{children}</>
  return (
    <>
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {pendingLabel ?? children}
    </>
  )
}

/**
 * Easner button. Same variants, sizes and radii as business/components/ui/button.tsx.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-[background-color,color,box-shadow,transform] duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-50 aria-busy:opacity-100",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:border-destructive",
    "active:translate-y-[0.5px]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/90",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-border bg-background hover:bg-muted/60 hover:text-foreground",
        ghost:
          "text-foreground hover:bg-muted/70",
        link:
          "text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-2xl px-3.5 text-sm has-[>svg]:px-3",
        default: "h-10 rounded-md px-5 text-sm has-[>svg]:px-4",
        lg: "h-12 rounded-md px-6 text-[15px] has-[>svg]:px-5",
        // Icon buttons keep their visual size but extend the hit area to 44px; give them an aria-label.
        icon: 'relative size-10 rounded-md after:absolute after:-inset-0.5 after:content-[""]',
        "icon-sm": 'relative size-9 rounded-2xl after:absolute after:-inset-1 after:content-[""]',
        "icon-lg": "size-12 rounded-md",
      },
      /** Full-width button (dialog footers on small screens). */
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      block: false,
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
      /** Shows a spinner and disables the control while an action runs. Ignored with `asChild`. */
      loading?: boolean
      /** Label beside the spinner while loading; defaults to `children`. */
      loadingLabel?: React.ReactNode
    }
>(function Button(
  { className, variant, size, block, asChild = false, loading = false, loadingLabel, disabled, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button"
  const isBusy = Boolean(loading) && !asChild

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block, className }))}
      disabled={disabled || isBusy}
      aria-busy={isBusy || undefined}
      ref={ref}
      {...props}
    >
      {isBusy ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
