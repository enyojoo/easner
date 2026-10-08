"use client"

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScaledScreenProps {
  /** Native layout size of the screen, in CSS px: the product's real width so type and spacing match it. */
  width: number
  height: number
  /**
   * "width": a box with the screen's aspect ratio that scales to the available width.
   * "contain": fills its positioned parent and fits the whole screen inside, centred.
   */
  fit?: "width" | "contain"
  /** Scale used for the server render, before the slot is measured. Pick the desktop value for the slot. */
  defaultScale?: number
  /** Vertical anchor for "contain" when there is spare height. */
  align?: "center" | "top" | "bottom"
  className?: string
  children: ReactNode
}

/**
 * Renders a product screen at its native size and scales it to the slot, so text sizes, spacing and
 * proportions match the real product instead of being retuned per breakpoint. Marketing screens are
 * pictures: hidden from assistive tech and out of the tab order; the slot carries the alt text.
 */
export function ScaledScreen({
  width,
  height,
  fit = "width",
  defaultScale = 1,
  align = "center",
  className,
  children,
}: ScaledScreenProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ scale: number; x: number; y: number }>({ scale: defaultScale, x: 0, y: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const { width: w, height: h } = el.getBoundingClientRect()
      if (!w) return
      if (fit === "width") {
        setBox({ scale: w / width, x: 0, y: 0 })
        return
      }
      const scale = Math.min(w / width, h / height)
      const spareY = h - height * scale
      setBox({
        scale,
        x: (w - width * scale) / 2,
        y: align === "top" ? 0 : align === "bottom" ? spareY : spareY / 2,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width, height, fit, align])

  const outerStyle: CSSProperties = fit === "width" ? { aspectRatio: `${width} / ${height}` } : {}
  return (
    <div ref={ref} className={cn(fit === "width" ? "relative w-full" : "absolute inset-0", className)} style={outerStyle}>
      <div
        aria-hidden="true"
        inert
        className="absolute left-0 top-0 origin-top-left select-none overflow-hidden"
        style={{ width, height, transform: `translate(${box.x}px, ${box.y}px) scale(${box.scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
