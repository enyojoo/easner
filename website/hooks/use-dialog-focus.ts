"use client"

import { useEffect, type RefObject } from "react"

/** Only the most recently opened dialog owns keyboard focus and Escape. */
const openDialogs: HTMLElement[] = []

export function useDialogFocus(
  open: boolean,
  dialogRef: RefObject<HTMLDivElement | null>,
  onOpenChange: (open: boolean) => void,
) {
  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusableElements = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0)

    openDialogs.push(dialog)
    focusableElements()[0]?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (openDialogs.at(-1) !== dialog || event.defaultPrevented) return
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChange(false)
        return
      }
      if (event.key !== "Tab") return

      const elements = focusableElements()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (!first) return
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      const wasTop = openDialogs.at(-1) === dialog
      const index = openDialogs.lastIndexOf(dialog)
      if (index !== -1) openDialogs.splice(index, 1)
      if (wasTop && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [open, dialogRef, onOpenChange])
}
