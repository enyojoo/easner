export const BRAND_BASE_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand"

export const MARKETING_ASSET_BASE = `${BRAND_BASE_URL}/marketing`

export const APP_STORE_URL = "#"
export const PLAY_STORE_URL = "#"

export const DOWNLOAD_PATH = "/download"

export const TESTFLIGHT_URL = "https://testflight.apple.com/join/UHP5WvF7"

export const ANDROID_APK_URL =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ??
  "https://github.com/enyojoo/easner/releases/latest/download/Easner-Beta.apk"
export const BUSINESS_SIGNUP_URL = "https://business.easner.com/auth/signup"

export const CONTACT_EMAIL = "hello@easner.com"
export const SUPPORT_EMAIL = "support@easner.com"
export const LEGAL_EMAIL = "legal@easner.com"
export const CONTACT_PATH = "/contact"
export const ACCESS_PATH = "/access"

export const API_DOCS_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("API documentation")}`

export const CAL_NAMESPACE = "15min"
export const CAL_LINK = "enyosam/15min"
