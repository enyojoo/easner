"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { blogFileUrl } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import type { FocalPoint } from "@/components/editor/types"

/** Storage paths become public URLs; blob and absolute URLs (the dev harness) pass through. */
export function fileUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return /^(blob:|data:|https?:|\/dev\/)/.test(path) ? path : blogFileUrl(path)
}

const CROPS = [
  { name: "Share image", note: "1200 × 630", aspect: "1200 / 630", use: "og:image, X, LinkedIn" },
  { name: "Card and header", note: "16:9", aspect: "16 / 9", use: "Index card, post header" },
  { name: "Square", note: "1:1", aspect: "1 / 1", use: "Schema image" },
] as const

/**
 * The cover is the share image, full-bleed. One upload, one focal point; every crop is previewed from it.
 * Alt text is required to publish.
 */
export function CoverField({
  coverPath,
  coverAlt,
  focal,
  disabled,
  onUpload,
  onAltChange,
  onFocalChange,
}: {
  coverPath: string | null
  coverAlt: string | null
  focal: FocalPoint | null
  disabled?: boolean
  onUpload: (file: File) => Promise<void>
  onAltChange: (alt: string) => void
  onFocalChange: (focal: FocalPoint) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const url = fileUrl(coverPath)
  const point = focal ?? { x: 0.5, y: 0.5 }
  const position = `${point.x * 100}% ${point.y * 100}%`

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      await onUpload(file)
    } finally {
      setBusy(false)
    }
  }

  const setFocal = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    const clamp = (value: number) => Math.min(1, Math.max(0, Math.round(value * 100) / 100))
    onFocalChange({ x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) })
  }

  return (
    <div className="grid gap-3">
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        aria-label="Choose a cover image"
        onChange={(event) => {
          void pick(event.target.files?.[0])
          event.target.value = ""
        }}
      />
      {url ? (
        <>
          <div
            role="group"
            aria-label="Cover focal point. Click the image to set the point every crop keeps in frame."
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              setFocal(event)
            }}
            onPointerMove={(event) => event.buttons === 1 && setFocal(event)}
            className={cn("relative overflow-hidden rounded-lg border border-border bg-muted", !disabled && "cursor-crosshair")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- editor preview of an uploaded file */}
            <img src={url} alt="" className="block h-auto w-full select-none" draggable={false} />
            <div className="pointer-events-none absolute inset-[10%] rounded border border-dashed border-white/80" aria-hidden />
            <span
              aria-hidden
              className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/80 shadow-card"
              style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Click to set the focal point. The dashed box is the safe area: keep the subject inside the centre 80%.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CROPS.map((crop) => (
              <figure key={crop.name} className="grid gap-1">
                <div className="overflow-hidden rounded-md border border-border bg-muted" style={{ aspectRatio: crop.aspect }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- crop preview */}
                  <img src={url} alt="" className="size-full object-cover" style={{ objectPosition: position }} draggable={false} />
                </div>
                <figcaption className="text-[11px] leading-4 text-muted-foreground">
                  <span className="block font-medium text-foreground">{crop.name}</span>
                  {crop.note}
                </figcaption>
              </figure>
            ))}
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Cover alt text
            <Input
              value={coverAlt ?? ""}
              disabled={disabled}
              placeholder="Describe the cover for readers who can’t see it"
              onChange={(event) => onAltChange(event.target.value)}
              aria-invalid={!(coverAlt ?? "").trim()}
            />
          </label>
          {!disabled ? (
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? <Loader2 className="animate-spin" aria-hidden /> : <RefreshCw aria-hidden />}
              Replace cover
            </Button>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            void pick(event.dataTransfer.files?.[0])
          }}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted/70 disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
          <span className="font-medium text-foreground">Add a cover</span>
          <span className="text-xs">Drop or choose a 2400 × 1350 image. It is also the share image.</span>
        </button>
      )}
    </div>
  )
}
