import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { mediaUrl } from "./urls"
import type { FocalPoint } from "./types"

async function loadOriginal(storedPath: string): Promise<Buffer | null> {
  try {
    if (storedPath.startsWith("/")) {
      return await readFile(path.join(process.cwd(), "public", storedPath))
    }
    const response = await fetch(mediaUrl(storedPath), { next: { revalidate: 86400 } })
    return response.ok ? Buffer.from(await response.arrayBuffer()) : null
  } catch {
    return null
  }
}

/**
 * Crop a stored image to `width × height` around a focal point (0 to 1 each way) and encode it as JPEG. Cuts the
 * largest box of the target aspect that fits, centred on the focal point and clamped to the image, then resizes.
 * Returns null when the image can't be read or sharp isn't available (callers fall back to the text card).
 */
export async function cropImage(storedPath: string, focal: FocalPoint | null, width: number, height: number) {
  const input = await loadOriginal(storedPath)
  if (!input) return null
  try {
    const { default: sharp } = await import("sharp")
    const image = sharp(input)
    const { width: w = 0, height: h = 0 } = await image.metadata()
    if (!w || !h) return null
    const target = width / height
    const cropW = Math.round(w / h > target ? h * target : w)
    const cropH = Math.round(w / h > target ? h : w / target)
    const fx = focal?.x ?? 0.5
    const fy = focal?.y ?? 0.5
    const left = Math.min(Math.max(0, Math.round(fx * w - cropW / 2)), w - cropW)
    const top = Math.min(Math.max(0, Math.round(fy * h - cropH / 2)), h - cropH)
    return await image
      .extract({ left, top, width: cropW, height: cropH })
      .resize(width, height)
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer()
  } catch (error) {
    console.error("[blog] image crop failed", storedPath, error)
    return null
  }
}

export function jpegResponse(buffer: Buffer): Response {
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  })
}
