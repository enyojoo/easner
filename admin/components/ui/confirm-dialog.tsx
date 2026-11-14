"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** A direct question: "Restrict this account?" */
  title: string
  /** The effect, in one or two plain sentences. */
  description?: React.ReactNode
  /** Extra content between the description and the footer (e.g. a reason field). */
  children?: React.ReactNode
  /** The button is named for the action: "Restrict account", not "Confirm". */
  confirmLabel: string
  cancelLabel?: string
  /** destructive for consequential or irreversible actions. */
  tone?: "default" | "destructive"
  /** Disables both buttons and shows a spinner on confirm while the action runs. */
  pending?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void | Promise<void>
}

/**
 * Confirm before consequence. Where the step-up security check applies, call it from onConfirm
 * (the dialog stays open while `pending`).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  pending = false,
  confirmDisabled = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            loading={pending}
            disabled={confirmDisabled}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
