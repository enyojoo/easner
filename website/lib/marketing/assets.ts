import type { StaticImageData } from "next/image"
import { BRAND_BASE_URL } from "./constants"
import freelancerPhoto from "@/assets/Freelancer.jpg"
import smePhoto from "@/assets/Sme.jpg"
import developerPhoto from "@/assets/Developer.jpg"
import personalHeroPhoto from "@/assets/personalhero.png"
import sendMoneyPhoto from "@/assets/sendmoney.png"
import receiveMoneyPhoto from "@/assets/receivemoney.png"
import easnerTagHandlePhoto from "@/assets/easetaghandle.png"
import securityPhoto from "@/assets/security.png"

type MarketingAsset = string | StaticImageData

const INTERIM_FALLBACKS: Record<string, MarketingAsset> = {
  "mkt-ui-business-dashboard": `${BRAND_BASE_URL}/eb1.png`,
  "mkt-icon-compliance": `${BRAND_BASE_URL}/security.svg`,
  "mkt-hero-personal-01": personalHeroPhoto,
  "mkt-ui-personal-send": sendMoneyPhoto,
  "mkt-ui-personal-receive": receiveMoneyPhoto,
  "mkt-ui-personal-recipients": easnerTagHandlePhoto,
  "mkt-ui-personal-security": securityPhoto,
  "mkt-persona-diaspora": freelancerPhoto,
  "mkt-persona-sme": smePhoto,
  "mkt-persona-dev": developerPhoto,
}

const ASSET_OBJECT_POSITION: Record<string, string> = {
  "mkt-hero-personal-01": "50% 50%",
  "mkt-persona-diaspora": "50% 38%",
  "mkt-persona-sme": "50% 22%",
  "mkt-persona-dev": "50% 42%",
}

export type MarketingVisualKind =
  | "phone"
  | "dashboard"
  | "business"
  | "stablecoin"
  | "invoice"
  | "api"
  | "card"
  | "map"
  | "terminal"
  | "qr"
  | "compliance"
  | "persona"
  | "icon"

const VISUAL_KIND_BY_ASSET: Record<string, MarketingVisualKind> = {
  "mkt-hero-home-01": "dashboard",
  "mkt-hero-personal-01": "persona",
  "mkt-ui-personal-send": "phone",
  "mkt-ui-personal-receive": "phone",
  "mkt-ui-personal-recipients": "phone",
  "mkt-ui-personal-security": "phone",
  "mkt-thumb-personal": "icon",
  "mkt-hero-business-01": "dashboard",
  "mkt-ui-business-dashboard": "dashboard",
  "mkt-ui-business-send": "business",
  "mkt-ui-business-accounts": "business",
  "mkt-ui-business-team": "business",
  "mkt-ui-business-collections": "business",
  "mkt-thumb-business": "icon",
  "mkt-hero-stablecoin-01": "stablecoin",
  "mkt-diagram-invisible-rails": "map",
  "mkt-ui-stablecoin-receive": "stablecoin",
  "mkt-ui-stablecoin-send": "stablecoin",
  "mkt-ui-stablecoin-terminal": "stablecoin",
  "mkt-ui-stablecoin-qrpay": "stablecoin",
  "mkt-ui-terminal": "terminal",
  "mkt-ui-qrpay": "qr",
  "mkt-hero-invoicing-01": "invoice",
  "mkt-ui-invoice-editor": "invoice",
  "mkt-ui-invoice-payin": "invoice",
  "mkt-ui-invoice-bank-payin": "invoice",
  "mkt-ui-invoice-stablecoin-payin": "invoice",
  "mkt-ui-invoice-customers": "invoice",
  "mkt-hero-cards-01": "card",
  "mkt-ui-cards-controls": "card",
  "mkt-ui-cards-issue": "card",
  "mkt-ui-cards-cardholders": "card",
  "mkt-ui-cards-reporting": "card",
  "mkt-hero-apis-01": "api",
  "mkt-ui-api-identity": "api",
  "mkt-ui-api-payin": "api",
  "mkt-ui-api-payouts": "api",
  "mkt-ui-api-webhooks": "api",
  "mkt-ui-api-dev-panel": "api",
  "mkt-thumb-apis": "icon",
  "mkt-thumb-stablecoin": "icon",
  "mkt-thumb-invoicing": "icon",
  "mkt-thumb-cards": "icon",
  "mkt-icon-api-banking": "icon",
  "mkt-icon-api-agency": "icon",
  "mkt-icon-api-integration": "icon",
  "mkt-map-corridors": "map",
  "mkt-icon-compliance": "compliance",
  "mkt-icon-security": "compliance",
  "mkt-icon-pillar-ux": "icon",
  "mkt-icon-pillar-cost": "icon",
  "mkt-icon-pillar-compliance": "icon",
  "mkt-icon-pillar-invisible": "icon",
  "mkt-persona-diaspora": "persona",
  "mkt-persona-sme": "persona",
  "mkt-persona-dev": "persona",
}

const PERSONAL_MOBILE_SLOTS = new Set([
  "mkt-hero-personal-01",
  "mkt-ui-personal-send",
  "mkt-ui-personal-receive",
  "mkt-ui-personal-recipients",
  "mkt-ui-personal-security",
])

export function getAssetUrl(assetId: string): MarketingAsset | null {
  return INTERIM_FALLBACKS[assetId] ?? null
}

export function getAssetObjectPosition(assetId: string): string | undefined {
  return ASSET_OBJECT_POSITION[assetId]
}

export function getAssetImageFit(assetId: string, kind: MarketingVisualKind, fill: boolean): "cover" | "contain" {
  if (
    assetId === "mkt-hero-personal-01" ||
    assetId === "mkt-ui-personal-send" ||
    assetId === "mkt-ui-personal-receive" ||
    assetId === "mkt-ui-personal-recipients" ||
    assetId === "mkt-ui-personal-security"
  ) {
    return "cover"
  }
  if (kind === "persona") return "contain"
  if (fill) return "contain"
  return "cover"
}

export function getVisualKind(assetId: string): MarketingVisualKind {
  return VISUAL_KIND_BY_ASSET[assetId] ?? "icon"
}

export function isPersonalMobileSlot(assetId: string): boolean {
  return PERSONAL_MOBILE_SLOTS.has(assetId)
}

export function isPlaceholderOnly(assetId: string): boolean {
  return !INTERIM_FALLBACKS[assetId]
}
