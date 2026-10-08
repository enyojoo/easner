/**
 * Visual slots rendered from design-system product screens instead of images or older mockups.
 * Each page registers native-size canvases in ./slots; ScreenSlot fits a canvas to its slot.
 */
import { cn } from "@/lib/utils"
import { BIZ_HOME_SIZE, BizHomeScreen } from "./biz-home-screen"
import { at, type Canvas } from "./canvas"
import { BrowserFrame } from "./frames"
import { ScaledScreen } from "./scaled-screen"
import { BUSINESS_SLOTS } from "./slots/business"
import { CARDS_SLOTS } from "./slots/cards"
import { CHECKOUT_SLOTS } from "./slots/checkout"
import { INVOICING_SLOTS } from "./slots/invoicing"
import { PAYMENT_LINKS_SLOTS } from "./slots/payment-links"
import { DEVELOPERS_SLOTS } from "./slots/developers"
import { PARTNERS_SLOTS } from "./slots/partners"
import { PAYROLL_SLOTS } from "./slots/payroll"
import { PERSONAL_SLOTS } from "./slots/personal"
import { STABLECOIN_SLOTS } from "./slots/stablecoin"

const SCREEN_SLOTS: Record<string, Canvas> = {
  ...PERSONAL_SLOTS,
  ...BUSINESS_SLOTS,
  ...DEVELOPERS_SLOTS,
  ...CHECKOUT_SLOTS,
  ...PAYMENT_LINKS_SLOTS,
  ...INVOICING_SLOTS,
  ...PAYROLL_SLOTS,
  ...CARDS_SLOTS,
  ...STABLECOIN_SLOTS,
  ...PARTNERS_SLOTS,
}

export function hasScreenSlot(assetId: string): boolean {
  return assetId in SCREEN_SLOTS
}

/** Renders a screen slot filling its positioned container, on the ivory web band. */
export function ScreenSlot({ assetId, alt, className }: { assetId: string; alt: string; className?: string }) {
  const canvas = SCREEN_SLOTS[assetId]
  if (!canvas) return null
  const { mobile } = canvas
  return (
    <div role="img" aria-label={alt} className={cn("relative h-full w-full overflow-hidden bg-web-band", className)}>
      <div className={cn("absolute inset-0", mobile && "hidden sm:block")}>
        <ScaledScreen width={canvas.width} height={canvas.height} fit="contain" defaultScale={0.6}>
          {canvas.render()}
        </ScaledScreen>
      </div>
      {mobile && (
        <div className="absolute inset-0 sm:hidden">
          <ScaledScreen width={mobile.width} height={mobile.height} fit="contain" defaultScale={0.6}>
            {mobile.render()}
          </ScaledScreen>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- Homepage hero */

const HOME_HERO = { width: 1280, height: 740 }
/** Phones: the dashboard's main column (balance, actions, money in and out), cropped so it stays legible. */
const HOME_HERO_MOBILE = { width: 620, height: 560 }

function browserWithBizHome() {
  return (
    <div style={{ width: BIZ_HOME_SIZE.width, height: BIZ_HOME_SIZE.height + 44 }} className="rounded-[20px] shadow-showcase">
      <BrowserFrame url="business.easner.com">
        <BizHomeScreen />
      </BrowserFrame>
    </div>
  )
}

/** Homepage hero: Easner Business Home in a browser. Below 640px, a crop of its main column. */
export function HomeHeroVisual({ alt }: { alt: string }) {
  return (
    <div role="img" aria-label={alt} className="relative w-full">
      <div className="hidden sm:block">
        <ScaledScreen width={HOME_HERO.width} height={HOME_HERO.height} defaultScale={1152 / HOME_HERO.width}>
          {at(40, 40, browserWithBizHome())}
        </ScaledScreen>
      </div>
      <div className="sm:hidden">
        <ScaledScreen width={HOME_HERO_MOBILE.width} height={HOME_HERO_MOBILE.height} defaultScale={0.55}>
          {at(-268, 24, browserWithBizHome())}
        </ScaledScreen>
      </div>
    </div>
  )
}
