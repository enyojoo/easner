"use client"

import { Toaster as SonnerToaster, type ToasterProps } from "sonner"

/**
 * Easner toast wrapper – muted semantic palette, private-bank tone.
 * Mirrors the business app so office + business share toast styling.
 */
function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      richColors={false}
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-md border border-border/60 bg-card text-card-foreground shadow-card p-4",
          title: "text-sm font-semibold tracking-tight",
          description: "text-sm text-muted-foreground",
          actionButton:
            "inline-flex h-8 items-center rounded-2xl bg-foreground px-3 text-xs font-medium text-background",
          cancelButton:
            "inline-flex h-8 items-center rounded-2xl bg-muted px-3 text-xs font-medium text-foreground",
          success:
            "bg-card text-card-foreground [&_[data-icon]]:text-success-text",
          error:
            "bg-card text-card-foreground [&_[data-icon]]:text-destructive-text",
          warning:
            "bg-card text-card-foreground [&_[data-icon]]:text-warning-text",
          info:
            "bg-card text-card-foreground [&_[data-icon]]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
