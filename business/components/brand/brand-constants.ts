const SUPABASE_BRAND = "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand"

export const BRAND = {
  name: "Easner",
  /** Full Easner Business logo (icon + Easner + Business) - used in auth, invoice view, sidebar */
  logoBusiness: `${SUPABASE_BRAND}/Easner%20Business.svg`,
  logo: `${SUPABASE_BRAND}/Easner%20Logo.svg`,
  /** Icon-only asset for card design (matches mobile) */
  icon: "/easner-icon.png",
  /** Full logo for PDF - react-pdf does not support SVG */
  logoPdf: `${SUPABASE_BRAND}/Easner%20Business.png`,
  /** Local PDF logo (public folder) - avoids CORS when generating PDF in browser */
  logoPdfLocal: "/Easner%20Business.png",
} as const
