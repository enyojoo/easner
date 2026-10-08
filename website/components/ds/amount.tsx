import { moneyParts, type FormatMoneyOptions } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"

/**
 * Amount – money in the Easner format (design system: components/Amount).
 * Tabular figures; cents at 60% at display sizes (24px+) and 80% at 16–23px; money in shown
 * with "+" in blue when `signed`. Size and colour come from the caller's text classes.
 */
interface AmountProps extends FormatMoneyOptions {
  value: number
  currency?: string
  /** Relative size of the cents: "display" 60% (24px+), "large" 80% (16–23px), "full" for small text. */
  minor?: "display" | "large" | "full"
  /** Colour for money in when signed; defaults to primary-text. Pass "" to inherit. */
  positiveClassName?: string
  className?: string
}

export function Amount({
  value,
  currency = "USD",
  cents,
  signed,
  minor = "full",
  positiveClassName = "text-primary-text",
  className,
}: AmountProps) {
  const parts = moneyParts(value, currency, { cents, signed })
  const positive = signed && value > 0
  return (
    <span className={cn("tabular-nums", positive && positiveClassName, className)}>
      {parts.sign}
      {parts.major}
      {parts.minor && (
        <span className={cn(minor === "display" && "text-[0.6em] tracking-normal", minor === "large" && "text-[0.8em]")}>
          {parts.minor}
        </span>
      )}
    </span>
  )
}
