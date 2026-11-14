/* eslint-disable @next/next/no-img-element -- the image renderer (satori) draws plain <img>, not next/image */
import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { cropImage, jpegResponse } from "./crop"
import { SHARE_SIZE } from "./urls"
import type { FocalPoint } from "./types"

/*
 * The text fallback for a share image: the existing OgCard layout (ivory left with the logo, headline and
 * easner.com; an Easner-blue panel on the right) redrawn for the image renderer, which can't run the site's React
 * components. Only used when a post has no cover, a category has no art or an author has no photo, so a share is
 * never blank. Hex values mirror the design tokens (--brand-ivory, --brand-primary, --brand-navy, --web-ink).
 */
const COLOR = { ivory: "#f6f3eb", blue: "#007acc", blueDeep: "#005a9e", navy: "#0a2540", ink: "#0a2540", body: "#4a5a6a", meta: "#6b7a89", hairline: "#d9dee3", white: "#ffffff" }

/** The Geist TTFs ship in the `geist` package (hoisted to the monorepo root); the image renderer can't read woff2. */
async function geist(file: string) {
  const dirs = [process.cwd(), path.join(process.cwd(), "..")]
  for (const dir of dirs) {
    try {
      return await readFile(path.join(dir, "node_modules/geist/dist/fonts/geist-sans", file))
    } catch {
      /* try the next location */
    }
  }
  throw new Error(`Geist font ${file} not found`)
}

async function fonts() {
  try {
    const [regular, bold] = await Promise.all([geist("Geist-Regular.ttf"), geist("Geist-Bold.ttf")])
    return [
      { name: "Geist", data: regular, weight: 400 as const },
      { name: "Geist", data: bold, weight: 700 as const },
    ]
  } catch {
    return undefined
  }
}

async function publicSvg(file: string) {
  try {
    const svg = await readFile(path.join(process.cwd(), "public", file))
    return `data:image/svg+xml;base64,${svg.toString("base64")}`
  } catch {
    return null
  }
}

function headlineSize(title: string) {
  const n = title.length
  return n <= 28 ? 56 : n <= 48 ? 46 : n <= 72 ? 38 : 32
}

interface CardInput {
  title: string
  /** Small label above the title, e.g. "Blog" or "Global money". */
  label: string
  line?: string
  /** A data URL for the right panel (an author photo). Defaults to the Easner mark. */
  photo?: string | null
}

export async function textCardResponse({ title, label, line, photo }: CardInput): Promise<Response> {
  const [logo, mark, fontList] = await Promise.all([publicSvg("easner-logo.svg"), publicSvg("easner-mark.svg"), fonts()])
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: COLOR.ivory, fontFamily: "Geist, sans-serif", color: COLOR.ink }}>
        <div style={{ display: "flex", flexDirection: "column", width: 720, height: "100%", padding: "56px 64px 52px 64px" }}>
          {logo ? <img src={logo} alt="" width={138} height={30} style={{ height: 30, width: 138 }} /> : <div style={{ fontSize: 30, fontWeight: 700 }}>Easner</div>}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLOR.blue }}>{label}</div>
            <div style={{ marginTop: 14, fontSize: headlineSize(title), fontWeight: 700, lineHeight: 1.16, letterSpacing: -0.5, display: "flex" }}>{title}</div>
            {line && <div style={{ marginTop: 20, fontSize: 24, lineHeight: 1.4, color: COLOR.body, display: "flex" }}>{line}</div>}
          </div>
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${COLOR.hairline}`, fontSize: 18, fontWeight: 500, color: COLOR.meta, display: "flex" }}>easner.com</div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: `linear-gradient(165deg, ${COLOR.blue}, ${COLOR.blueDeep})` }}>
          {photo ? (
            <img src={photo} alt="" width={320} height={320} style={{ width: 320, height: 320, borderRadius: 160, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 240, height: 240, borderRadius: 48, background: COLOR.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {mark ? <img src={mark} alt="" width={120} height={120} style={{ width: 120, height: 120 }} /> : null}
            </div>
          )}
        </div>
      </div>
    ),
    { ...SHARE_SIZE, fonts: fontList, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } },
  )
}

/** The cover (or an override), cropped to 1200×630 around the focal point; the text card when there is no image. */
export async function shareImageResponse(source: { path: string | null; focal: FocalPoint | null }, card: CardInput): Promise<Response> {
  if (source.path) {
    const buffer = await cropImage(source.path, source.focal, SHARE_SIZE.width, SHARE_SIZE.height)
    if (buffer) return jpegResponse(buffer)
  }
  return textCardResponse(card)
}
