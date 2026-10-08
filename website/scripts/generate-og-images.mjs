#!/usr/bin/env node
/**
 * Generate social share images (Open Graph and X) from the cards drawn at /og/[slug].
 * Usage: start the dev server (npm run dev), then: node scripts/generate-og-images.mjs [baseUrl]
 *
 * Writes app/(marketing)/<route>/opengraph-image.jpg and opengraph-image.alt.txt for every card in
 * lib/marketing/og-cards.ts; Next.js turns those files into og:image and twitter:image tags.
 * Uses the installed Google Chrome (or CHROME_PATH).
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright-core"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEBSITE_ROOT = path.resolve(__dirname, "..")
const MARKETING = path.join(WEBSITE_ROOT, "app/(marketing)")
const BASE_URL = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")

/** Read slugs, routes and alt text from the card list without compiling TypeScript. */
function readCards() {
  const source = fs.readFileSync(path.join(WEBSITE_ROOT, "lib/marketing/og-cards.ts"), "utf8")
  const cards = []
  const pattern = /slug: "([^"]+)",\s*route: "([^"]*)",[\s\S]*?alt: "([^"]+)",/g
  let match
  while ((match = pattern.exec(source)) !== null) cards.push({ slug: match[1], route: match[2], alt: match[3] })
  return cards
}

const cards = readCards()
if (cards.length === 0) {
  console.error("No cards found in lib/marketing/og-cards.ts")
  process.exit(1)
}

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" },
)
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })

for (const card of cards) {
  const response = await page.goto(`${BASE_URL}/og/${card.slug}`, { waitUntil: "networkidle" })
  if (!response?.ok()) {
    console.error(`Card ${card.slug} returned ${response?.status()}. Is the dev server running at ${BASE_URL}?`)
    process.exit(1)
  }
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
  const dir = path.join(MARKETING, card.route)
  await page.locator("#og-card").screenshot({ path: path.join(dir, "opengraph-image.jpg"), type: "jpeg", quality: 90 })
  fs.writeFileSync(path.join(dir, "opengraph-image.alt.txt"), card.alt)
  console.log(`Wrote ${path.relative(WEBSITE_ROOT, path.join(dir, "opengraph-image.jpg"))}`)
}

await browser.close()
