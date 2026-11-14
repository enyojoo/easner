"use client"

import { useEffect, useRef, useState } from "react"
import { validateAvatarSize } from "@/lib/blog/crops"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const VIEW = 280
const OUTPUT = 800
export const AVATAR_MIN = 400

/** Pure: the source square (in image pixels) a view of `zoom` and `offset` (px in the view) shows. */
export function avatarSourceRect(w: number, h: number, zoom: number, offsetX: number, offsetY: number) {
  const scale = (VIEW * zoom) / Math.min(w, h)
  const size = VIEW / scale
  const x = Math.min(Math.max(w / 2 - offsetX / scale - size / 2, 0), w - size)
  const y = Math.min(Math.max(h / 2 - offsetY / scale - size / 2, 0), h - size)
  return { x, y, size, scale }
}

type Props = {
  file: File | null
  onCancel: () => void
  /** Called with the square JPEG once the person confirms the crop. */
  onConfirm: (blob: Blob) => void | Promise<void>
}

/** Circular crop with zoom to a square, at least 400 × 400 (OffBlogTaxonomy: My profile). */
export function AvatarCropper({ file, onCancel, onConfirm }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setUrl(objectUrl)
      setSize({ w: img.naturalWidth, h: img.naturalHeight })
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      setError(validateAvatarSize(img.naturalWidth, img.naturalHeight))
    }
    img.onerror = () => setError("This file isn’t an image we can read.")
    img.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const clamp = (x: number, y: number, z: number) => {
    if (!size) return { x, y }
    const scale = (VIEW * z) / Math.min(size.w, size.h)
    const maxX = Math.max(0, (size.w * scale - VIEW) / 2)
    const maxY = Math.max(0, (size.h * scale - VIEW) / 2)
    return { x: Math.min(Math.max(x, -maxX), maxX), y: Math.min(Math.max(y, -maxY), maxY) }
  }

  const rect = size ? avatarSourceRect(size.w, size.h, zoom, offset.x, offset.y) : null

  const confirm = async () => {
    if (!file || !size || !rect || !url) return
    setBusy(true)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      const canvas = document.createElement("canvas")
      canvas.width = OUTPUT
      canvas.height = OUTPUT
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("This browser can’t crop images.")
      ctx.drawImage(img, rect.x, rect.y, rect.size, rect.size, 0, 0, OUTPUT, OUTPUT)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9))
      if (!blob) throw new Error("Couldn’t crop this photo.")
      await onConfirm(blob)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t crop this photo.")
    } finally {
      setBusy(false)
    }
  }

  const imgScale = size ? (VIEW * zoom) / Math.min(size.w, size.h) : 1

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && !busy && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
          <DialogDescription>Drag to position it and zoom to fit. It shows as a circle on the blog.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative touch-none overflow-hidden rounded-full bg-muted ring-1 ring-border"
            style={{ width: VIEW, height: VIEW, cursor: "grab" }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
            }}
            onPointerMove={(e) => {
              const d = drag.current
              if (!d) return
              setOffset(clamp(d.ox + e.clientX - d.x, d.oy + e.clientY - d.y, zoom))
            }}
            onPointerUp={() => (drag.current = null)}
            aria-label="Photo preview"
          >
            {url && size ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL
              <img
                src={url}
                alt=""
                draggable={false}
                className="pointer-events-none absolute max-w-none select-none"
                style={{
                  width: size.w * imgScale,
                  height: size.h * imgScale,
                  left: VIEW / 2 - (size.w * imgScale) / 2 + offset.x,
                  top: VIEW / 2 - (size.h * imgScale) / 2 + offset.y,
                }}
              />
            ) : null}
          </div>
          <label className="flex w-full items-center gap-3 text-sm text-muted-foreground">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => {
                const z = Number(e.target.value)
                setZoom(z)
                setOffset((o) => clamp(o.x, o.y, z))
              }}
              className="h-1 flex-1 accent-primary"
              aria-label="Zoom"
            />
          </label>
          {error ? <p className="text-sm text-destructive-text">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" variant="primary" loading={busy} disabled={!size || Boolean(error && !rect) || (size ? Math.min(size.w, size.h) < AVATAR_MIN : true)} onClick={() => void confirm()}>
            Use photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
