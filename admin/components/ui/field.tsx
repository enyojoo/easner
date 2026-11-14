"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type FieldProps = {
  /** Always visible. Placeholders are examples, not labels. */
  label: string
  /** One control (Input, Textarea, Select trigger). Gets id, aria-describedby and aria-invalid. */
  children: React.ReactElement<Record<string, unknown>>
  hint?: React.ReactNode
  error?: React.ReactNode
  /** Marks the few optional fields; required is the default and needs no asterisk. */
  optional?: boolean
  id?: string
  className?: string
}

/**
 * Wraps one form control with its label, hint and error and wires the aria attributes.
 */
export function Field({ label, children, hint, error, optional, id, className }: FieldProps) {
  const autoId = React.useId()
  const controlId = id ?? (children.props.id as string | undefined) ?? autoId
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [children.props["aria-describedby"] as string | undefined, hintId, errorId]
    .filter(Boolean)
    .join(" ")

  const control = React.cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : children.props["aria-invalid"],
  })

  return (
    <div data-slot="field" className={cn("grid gap-1.5", className)}>
      <label htmlFor={controlId} className="text-sm font-medium text-foreground">
        {label}
        {optional ? <span className="ml-1 font-normal text-muted-foreground">(optional)</span> : null}
      </label>
      {control}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive-text">
          {error}
        </p>
      ) : null}
    </div>
  )
}
