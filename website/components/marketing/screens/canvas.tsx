/**
 * Canvas helpers for composing product screens at native size. A canvas is placed in a slot by
 * ScreenSlot, which scales it to fit; everything inside is drawn in the product's own pixels.
 */
import type { ReactNode } from "react"
import { PHONE_CANVAS, PhoneFrame } from "./frames"

export interface Canvas {
  width: number
  height: number
  render: () => ReactNode
  /** Simpler composition below 640px, where a multi-screen canvas would shrink text past legibility. */
  mobile?: Omit<Canvas, "mobile">
}

export function at(x: number, y: number, node: ReactNode, z = 0) {
  return (
    <div className="absolute" style={{ left: x, top: y, zIndex: z }}>
      {node}
    </div>
  )
}

/** One phone, cropped to its top part so the screen reads at a useful size in a short card. */
export function phoneCard(screen: ReactNode, height = 520): Canvas {
  return { width: PHONE_CANVAS.width, height, render: () => at(0, 10, <PhoneFrame>{screen}</PhoneFrame>) }
}

/**
 * A fragment of a product web screen (one card or panel) centred on a canvas with room for its shadow.
 * Feature cards are about 600 × 350 on desktop, so fragments are drawn close to that size and stay legible.
 */
export function panel(width: number, height: number, node: ReactNode, inset = 28): Canvas {
  return {
    width: width + inset * 2,
    height: height + inset * 2,
    render: () => at(inset, inset, <div style={{ width, height }}>{node}</div>),
  }
}
