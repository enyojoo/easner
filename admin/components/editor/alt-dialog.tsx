"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

/** Asked right after an image is inserted: alt text is required before the post can publish. */
export function AltTextDialog({
  open,
  src,
  onSave,
  onSkip,
}: {
  open: boolean
  src: string | null
  onSave: (alt: string) => void
  onSkip: () => void
}) {
  const [alt, setAlt] = useState("")
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onSkip()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Describe this image</DialogTitle>
          <DialogDescription>Alt text is read aloud to people who can’t see the image, and search engines read it too. Say what the image shows.</DialogDescription>
        </DialogHeader>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- upload preview
          <img src={src} alt="" className="max-h-48 w-full rounded-md border border-border object-contain" />
        ) : null}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (alt.trim()) {
              onSave(alt.trim())
              setAlt("")
            }
          }}
          className="grid gap-4"
        >
          <Input autoFocus aria-label="Alt text" placeholder="A founder in Lagos approving a payment on a phone" value={alt} onChange={(event) => setAlt(event.target.value)} />
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button type="button" variant="outline" onClick={onSkip}>
              Add later
            </Button>
            <Button type="submit" variant="primary" disabled={!alt.trim()}>
              Save alt text
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
