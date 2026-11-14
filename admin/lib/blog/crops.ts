export interface Focal { x: number; y: number }
export interface Rect { x: number; y: number; w: number; h: number }

export const CROPS = {
  share: { w: 1200, h: 630 },
  card: { w: 1600, h: 900 },
  header: { w: 1600, h: 900 },
  square: { w: 1000, h: 1000 },
} as const
export type CropName = keyof typeof CROPS

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"] as const

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Largest rect of `aspect` (w/h) inside the image, centred on the focal point and kept inside the image. */
export function cropRect(imgW: number, imgH: number, aspect: number, focal: Focal = { x: 0.5, y: 0.5 }): Rect {
  let w = imgW
  let h = w / aspect
  if (h > imgH) { h = imgH; w = h * aspect }
  const x = clamp(focal.x * imgW - w / 2, 0, imgW - w)
  const y = clamp(focal.y * imgH - h / 2, 0, imgH - h)
  return { x, y, w, h }
}

/** The centre 80% that every platform keeps. */
export function safeArea(imgW: number, imgH: number): Rect {
  return { x: imgW * 0.1, y: imgH * 0.1, w: imgW * 0.8, h: imgH * 0.8 }
}

/**
 * Avatar cropper: the view is a square showing the image at `zoom` (1 = shorter side fills it). Offsets are in view
 * fractions (0 = centred, positive moves the image right/down). Returns the square in image pixels.
 */
export function squareCropFromView(v: { imgW: number; imgH: number; zoom: number; offsetX: number; offsetY: number }): Rect {
  const zoom = Math.max(1, v.zoom)
  const side = Math.min(v.imgW, v.imgH) / zoom
  const cx = v.imgW / 2 - v.offsetX * side
  const cy = v.imgH / 2 - v.offsetY * side
  return { x: clamp(cx - side / 2, 0, v.imgW - side), y: clamp(cy - side / 2, 0, v.imgH - side), w: side, h: side }
}

export function validateCoverSize(w: number, h: number): string | null {
  if (w < 1600 || h < 900) return `This image is ${w} × ${h}. Covers should be at least 1600 × 900.`
  return null
}

export function validateAvatarSize(w: number, h: number): string | null {
  if (w < 400 || h < 400) return `This photo is ${w} × ${h}. It needs to be at least 400 × 400.`
  return null
}

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) return "Use a JPG, PNG, WebP, AVIF or GIF image."
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024))
    return `This file is ${mb} MB. The limit is 20 MB.`
  }
  return null
}
