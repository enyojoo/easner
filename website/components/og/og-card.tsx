"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { BIZ_HOME_SIZE } from "@/components/marketing/screens/biz-home-screen"
import { AppHomeScreen } from "@/components/marketing/screens/app-screens"
import { at } from "@/components/marketing/screens/canvas"
import { PHONE_CANVAS, PhoneFrame } from "@/components/marketing/screens/frames"
import { ScaledScreen } from "@/components/marketing/screens/scaled-screen"
import { browserWithBizHome, getScreenCanvas } from "@/components/marketing/screens/screen-slots"
import { SecurityIllustration } from "@/components/marketing/security-illustration"
import type { OgCard as OgCardData, OgVisual } from "@/lib/marketing/og-cards"
import { cn } from "@/lib/utils"

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

/** Headline size: up to 40px, smaller only when a line would otherwise wrap in the 460px column. */
function headlineSize(lines: string[]) {
  const longest = Math.max(...lines.map((line) => line.length))
  return Math.max(28, Math.min(40, Math.floor(460 / (longest * 0.8))))
}

/** Left edge of the blue panel; product visuals sit inside it and bleed off its right and bottom edges. */
const PANEL_X = 560

/** The visual inside the blue panel: a design-system screen, the app, a shield, or the Easner mark. */
function Visual({ visual }: { visual: OgVisual }): ReactNode {
  if (visual.kind === "home") {
    return (
      <div className="absolute left-[620px] top-[88px] h-[620px] w-[780px]">
        <ScaledScreen width={BIZ_HOME_SIZE.width + 80} height={BIZ_HOME_SIZE.height + 120} fit="contain" align="top" defaultScale={0.75}>
          {at(40, 40, browserWithBizHome())}
        </ScaledScreen>
      </div>
    )
  }
  if (visual.kind === "phone") {
    return (
      <div className="absolute left-[700px] top-[70px] h-[660px] w-[400px]">
        <ScaledScreen width={PHONE_CANVAS.width} height={PHONE_CANVAS.height} fit="contain" align="top" defaultScale={0.8}>
          {at(0, 0, <PhoneFrame><AppHomeScreen /></PhoneFrame>)}
        </ScaledScreen>
      </div>
    )
  }
  if (visual.kind === "shield") {
    return (
      <div className="absolute left-[640px] top-[110px] w-[480px]">
        <div className="rounded-[2rem] bg-brand-navy p-2.5 shadow-showcase">
          <SecurityIllustration className="border-white/10" />
        </div>
      </div>
    )
  }
  if (visual.kind === "mark") {
    return (
      <div className="absolute left-[680px] top-[155px] grid size-[320px] place-items-center rounded-[48px] bg-web-canvas shadow-showcase">
        <Image src="/easner-mark.svg" alt="" width={140} height={140} className="size-[140px]" />
      </div>
    )
  }
  const canvas = getScreenCanvas(visual.slot)
  if (!canvas) return null
  return (
    <div className="absolute left-[612px] top-[56px] h-[560px] w-[620px]">
      <ScaledScreen width={canvas.width} height={canvas.height} fit="contain" defaultScale={0.6}>
        {canvas.render()}
      </ScaledScreen>
    </div>
  )
}

/**
 * A 1200 × 630 share card. Ivory on the left with the logo, the headline, one line written
 * for sharing and easner.com; an Easner-blue panel on the right holding the product. Flat colour, no glows.
 */
export function OgCard({ card }: { card: OgCardData }) {
  return (
    <div
      id="og-card"
      className="relative overflow-hidden bg-web-band font-sans text-web-ink antialiased"
      style={{ width: OG_WIDTH, height: OG_HEIGHT }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0"
        style={{
          left: PANEL_X,
          background: "linear-gradient(165deg, color-mix(in srgb, var(--brand-primary) 9%, var(--web-canvas)), color-mix(in srgb, var(--brand-primary) 22%, var(--web-canvas)))",
        }}
      />
      <div aria-hidden="true" className="absolute inset-y-0 w-px bg-brand-primary/15" style={{ left: PANEL_X }} />

      <Visual visual={card.visual} />

      <div className="absolute bottom-[52px] left-[64px] top-[56px] flex w-[460px] flex-col">
        <Image src="/easner-logo.svg" alt="Easner" width={138} height={30} className="h-[30px] w-auto self-start" priority />
        <div className="mt-auto">
          <h1
            className="whitespace-nowrap font-display font-bold uppercase leading-[1.16] tracking-[-0.01em]"
            style={{ fontSize: headlineSize(card.headline) }}
          >
            {card.headline.map((line, index) => (
              <span key={line} className={cn("block", index === card.accentLine && "text-brand-primary")}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 text-[20px] leading-[30px] text-web-body">{card.line}</p>
        </div>
        <div className="mt-9 border-t border-web-hairline pt-5 text-[16px] font-medium text-web-meta">easner.com</div>
      </div>
    </div>
  )
}
