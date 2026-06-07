import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = "image/png"

const COLORS = {
  canvas: "#F6F3EB",
  ink: "#0F1110",
  muted: "#5F665F",
  accent: "#007ACC",
} as const

const websiteDir = join(dirname(fileURLToPath(import.meta.url)), "../..")
const monorepoRoot = join(websiteDir, "..")

export interface OgImageContent {
  headline: string | string[]
  subhead?: string
}

async function loadBundledFont(packagePath: string) {
  const candidates = [
    join(websiteDir, "node_modules", packagePath),
    join(monorepoRoot, "node_modules", packagePath),
  ]

  for (const path of candidates) {
    try {
      return await readFile(path)
    } catch {
      continue
    }
  }

  throw new Error(`Font not found: ${packagePath}`)
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function normalizeHeadline(headline: string | string[]) {
  return Array.isArray(headline) ? headline : [headline]
}

export async function createOgImage({ headline, subhead }: OgImageContent) {
  const [unbounded, inter] = await Promise.all([
    loadBundledFont("@fontsource/unbounded/files/unbounded-latin-600-normal.woff"),
    loadBundledFont("@fontsource/inter/files/inter-latin-400-normal.woff"),
  ])

  const headlineLines = normalizeHeadline(headline)
  const subheadText = subhead ? truncate(subhead, 130) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLORS.canvas,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 10%, rgba(0,122,204,0.12), transparent 32%), linear-gradient(180deg, #FFFFFF 0%, rgba(246,243,235,0) 75%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: COLORS.accent,
              }}
            />
            <div
              style={{
                fontFamily: "Unbounded",
                fontSize: 28,
                fontWeight: 600,
                color: COLORS.ink,
                letterSpacing: "-0.02em",
              }}
            >
              Easner
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {headlineLines.map((line) => (
                <div
                  key={line}
                  style={{
                    fontFamily: "Unbounded",
                    fontSize: headlineLines.length > 1 ? 68 : 72,
                    fontWeight: 600,
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    color: COLORS.ink,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            {subheadText ? (
              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: 28,
                  lineHeight: 1.45,
                  color: COLORS.muted,
                  maxWidth: 920,
                }}
              >
                {subheadText}
              </div>
            ) : null}
          </div>

          <div
            style={{
              fontFamily: "Inter",
              fontSize: 22,
              color: COLORS.muted,
            }}
          >
            easner.com
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Unbounded", data: unbounded, weight: 600, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
      ],
    }
  )
}
