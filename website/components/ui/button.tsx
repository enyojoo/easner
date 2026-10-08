"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        /** Easner blue CTA. With `pill` it is the website's primary pill (design system Button variant="primary" pill). */
        primary: "bg-brand-primary text-white hover:bg-primary-hover",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[6px] px-3",
        lg: "h-11 rounded-[6px] px-8",
        icon: "h-10 w-10",
      },
      /** Website CTA shape: full pill, 44px tall on phones and 48px from sm. */
      pill: {
        true: "h-11 rounded-full px-5 text-sm sm:h-12 sm:px-6",
        false: "",
      },
    },
    compoundVariants: [
      // The one coloured shadow in the system sits under the primary pill only.
      { variant: "primary", pill: true, className: "shadow-cta" },
      { variant: "outline", pill: true, className: "border-brand-stone bg-web-canvas/75 text-web-ink hover:bg-web-plate hover:text-web-ink" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      pill: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, pill, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, pill, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
