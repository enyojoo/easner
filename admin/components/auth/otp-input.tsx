"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type OtpInputProps = {
  /** Digits typed so far, up to `length`. */
  value: string
  onChange: (digits: string) => void
  length?: number
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  /** Names the group for screen readers ("Authenticator code"). */
  ariaLabel: string
  /** The id of the line that carries the error, so each box points at it. */
  describedBy?: string
  className?: string
}

/**
 * Six 44 by 48 boxes at radius 16, the active one ringed in primary. Typing moves on, Backspace
 * moves back, paste and the one-time-code suggestion fill every box. When the value is cleared
 * (a wrong code) focus returns to the first box.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  invalid,
  autoFocus,
  ariaLabel,
  describedBy,
  className,
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const previous = React.useRef(value)

  React.useEffect(() => {
    if (previous.current !== "" && value === "") refs.current[0]?.focus()
    previous.current = value
  }, [value])

  const digits = Array.from({ length }, (_, i) => value[i] ?? "")

  const setFrom = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "")
    if (!typed) return
    const next = (value.slice(0, index) + typed).slice(0, length)
    onChange(next)
    refs.current[Math.min(next.length, length - 1)]?.focus()
  }

  const onKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault()
      if (value[index]) onChange(value.slice(0, index) + value.slice(index + 1))
      else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index))
        refs.current[index - 1]?.focus()
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  return (
    <div role="group" aria-label={ariaLabel} className={cn("flex justify-center gap-2", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          maxLength={index === 0 ? length : 1}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          value={digit}
          onChange={(event) => setFrom(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => {
            event.preventDefault()
            setFrom(0, event.clipboardData.getData("text"))
          }}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            "h-12 w-11 rounded-2xl border border-input bg-card text-center text-xl font-semibold tabular-nums text-foreground",
            "transition-[border-color,box-shadow] outline-none",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25",
            "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  )
}
