const ONBOARDING_KEY = "business_onboarding"

export interface OnboardingData {
  countryCode: string
  businessName: string
}

export function getOnboarding(): OnboardingData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setOnboarding(data: OnboardingData) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Failed to save onboarding:", e)
  }
}
