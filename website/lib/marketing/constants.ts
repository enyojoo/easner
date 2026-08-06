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
export const DOWNLOAD_PATH = "/download"

export const PERSONAL_WEB_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easner.com"

export const PERSONAL_BANKING_CTA_DESCRIPTION =
  "Download the mobile app or use the web app for global banking."

export const PERSONAL_BANKING_CTA_DESCRIPTION_MOBILE =
  "Download the mobile app for global banking."

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
