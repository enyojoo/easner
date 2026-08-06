const DEFAULT_DOWNLOAD_PAGE = "https://www.easner.com/download"
const DEFAULT_APP_STORE_URL = "https://apps.apple.com/us/app/easner/id6762069433"
const DEFAULT_ANDROID_APK_URL =
  "https://github.com/enyojoo/easner/releases/latest/download/Easner-Beta.apk"

export type MobileAppStoreUrls = {
  appStore: string
  playStore: string
  androidApk: string
  downloadPage: string
}

/**
 * Resolve App Store / Play Store / APK URLs from env.
 * Keep env var names identical to easnerbanking's resolveMobileAppStoreUrls.
 */
export function resolveMobileAppStoreUrls(
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}
): MobileAppStoreUrls {
  const downloadPage = env.EASNER_DOWNLOAD_PAGE_URL ?? DEFAULT_DOWNLOAD_PAGE
  const androidApk = env.NEXT_PUBLIC_ANDROID_APK_URL ?? env.EASNER_ANDROID_APK_URL ?? DEFAULT_ANDROID_APK_URL

  return {
    appStore: env.EASNER_APP_STORE_URL ?? DEFAULT_APP_STORE_URL,
    // Until Play Store is live, prefer explicit Play URL, else APK, else platform fallback on /download
    playStore: env.EASNER_PLAY_STORE_URL ?? androidApk,
    androidApk,
    downloadPage,
  }
}
