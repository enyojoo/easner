import type React from "react"
import type { Metadata } from "next"
import { Unbounded } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { PostHogProvider } from "@/components/posthog-provider"
import { EASNER_CANONICAL_DEFINITION_SHORT } from "@/lib/marketing/constants"
import "./globals.css"

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
})

export const metadata: Metadata = {
  title: {
    default: "Easner | Cross-Border Banking, Payouts & Stablecoin Rails",
    template: "%s – Easner",
  },
  description: `${EASNER_CANONICAL_DEFINITION_SHORT} Easner is not a bank.`,
  keywords:
    "global cross-border payments, international business banking, cross-border B2B payouts, stablecoin banking infrastructure, multi-currency business account, pay suppliers internationally, diaspora banking, white-label remittance",
  formatDetection: { email: false, address: false, telephone: false },
  applicationName: "Easner",
  metadataBase: new URL("https://www.easner.com"),
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
    shortcut: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
    apple: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
  },
  openGraph: {
    title: "Easner | Cross-Border Banking, Payouts & Stablecoin Rails",
    description: `${EASNER_CANONICAL_DEFINITION_SHORT} Easner is not a bank.`,
    url: "https://www.easner.com",
    siteName: "Easner",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@easnerbanking",
    title: "Easner | Cross-Border Banking, Payouts & Stablecoin Rails",
    description: `${EASNER_CANONICAL_DEFINITION_SHORT} Easner is not a bank.`,
    creator: "@easnerbanking",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${unbounded.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans`} suppressHydrationWarning>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
