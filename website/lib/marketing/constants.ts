import { resolveMobileAppStoreUrls } from "@easner/shared"
import { APP_LINK_URL as CANONICAL_APP_LINK_URL } from "@/lib/download-routing"

export const BRAND_BASE_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand"

export const MARKETING_ASSET_BASE = `${BRAND_BASE_URL}/marketing`

const storeUrls = resolveMobileAppStoreUrls(process.env)

export const APP_STORE_URL = storeUrls.appStore
export const PLAY_STORE_URL = storeUrls.playStore
export const ANDROID_APK_URL = storeUrls.androidApk

export const APP_LINK_URL = CANONICAL_APP_LINK_URL
export const DOWNLOAD_PATH = "/app"

export const PERSONAL_WEB_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easner.com"

export const PERSONAL_BANKING_CTA_DESCRIPTION =
  "Download the mobile app or use the web app for global banking."

export const PERSONAL_BANKING_CTA_DESCRIPTION_MOBILE =
  "Download the mobile app for global banking."

/** Download landing already shows QR + email — desktop CTAs are web-app only. */
export const PERSONAL_BANKING_CTA_DESCRIPTION_WEB_APP_ONLY =
  "Use the web app for global banking."

export const OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION =
  "Download the mobile app or use the web app."

export const OPEN_ACCOUNT_PERSONAL_CTA_DESCRIPTION_MOBILE =
  "Download the mobile app."

export const BUSINESS_BANKING_CTA_DESCRIPTION =
  "Open a business account on the web dashboard."

export const BUSINESS_SIGNUP_URL = "https://business.easner.com/auth/signup"

export const CONTACT_EMAIL = "hello@easner.com"
export const SUPPORT_EMAIL = "support@easner.com"
export const LEGAL_EMAIL = "legal@easner.com"
export const CONTACT_PATH = "/contact"
export const ACCESS_PATH = "/access"

export const API_DOCS_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("API documentation")}`

export const CAL_NAMESPACE = "15min"
export const CAL_LINK = "enyo-easner/15min"

export {
  EASNER_CANONICAL_DEFINITION,
  EASNER_CANONICAL_DEFINITION_SHORT,
  EASNER_ONE_LINE_THESIS,
  EASNER_UX_LINE,
  EASNER_AUDIENCE_A,
  EASNER_AUDIENCE_B,
  EASNER_PRODUCT_PERSONAL,
  EASNER_PRODUCT_BUSINESS,
  EASNER_PRODUCT_PARTNERS,
  EASNER_SUPPORTED_LOCAL_MARKETS,
  EASNER_PRIMARY_KEYWORDS,
  EASNER_SUPPORTING_KEYWORDS,
  EASNER_CORRIDOR_VISUAL_ARIA_LABEL,
  EASNER_CORRIDOR_COVERAGE_FAQ,
} from "./positioning"
