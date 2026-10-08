import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { OgCard } from "@/components/og/og-card"
import { OG_CARDS } from "@/lib/marketing/og-cards"

/**
 * Renders one social share card for scripts/generate-og-images.mjs to capture. Development only:
 * production returns 404, so these pages are never public or indexed.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function OgCardPage({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === "production") notFound()
  const { slug } = await params
  const card = OG_CARDS.find((item) => item.slug === slug)
  if (!card) notFound()
  return (
    <>
      <style>{`html, body { margin: 0; background: transparent; } .intercom-lightweight-app, nextjs-portal { display: none !important; }`}</style>
      <OgCard card={card} />
    </>
  )
}
