export function resolveMobileAppStoreUrls(env = {}) {
  return {
    appStore: "https://apps.apple.com/us/app/easner/id6762069433",
    playStore: "https://play.google.com/store/apps/details?id=com.easner.android",
    androidApk: "https://example.com/app.apk",
    downloadPage: env.EASNER_DOWNLOAD_PAGE_URL ?? "https://www.easner.com/app",
  }
}
