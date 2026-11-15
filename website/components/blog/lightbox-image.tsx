"use client"

import Image from "next/image"
import { Maximize2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface LightboxImageProps {
  src: string
  alt: string
  caption?: string
  width: number
  height: number
  /** column (680), wide (960) or full. */
  layout: "column" | "wide" | "full"
  /** False for images that are not on our storage host (Next would refuse to optimise them). */
  optimize: boolean
}

/** A figure with an enlarge-on-click lightbox. The static HTML is a plain figure with an `<img>` that has alt and size. */
export function LightboxImage({ src, alt, caption, width, height, layout, optimize }: LightboxImageProps) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const opener = trigger.current
    // Focus moves into the dialog, stays there (it has one control), and returns to the image button on close.
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
      if (event.key === "Tab") {
        event.preventDefault()
        closeButton.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
      opener?.focus()
    }
  }, [open])

  return (
    <figure className={cn("bp-fig", layout !== "column" && layout)}>
      <div className="fi">
        <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-label={`Enlarge image: ${alt || "image"}`}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={layout === "column" ? "(min-width: 720px) 680px, 100vw" : "(min-width: 1024px) 960px, 100vw"}
            unoptimized={!optimize}
          />
        </button>
        <span className="zoom" aria-hidden="true">
          <Maximize2 size={16} />
        </span>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {open && (
        <div className="bp-lightbox" role="dialog" aria-modal="true" aria-label={alt || "Image"} onClick={() => setOpen(false)}>
          <button ref={closeButton} type="button" className="x" aria-label="Close" onClick={() => setOpen(false)}>
            <X size={18} aria-hidden="true" />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- the full-size original, loaded only when opened */}
            <img src={src} alt={alt} width={width} height={height} />
            {caption && <figcaption>{caption}</figcaption>}
          </figure>
        </div>
      )}
    </figure>
  )
}
