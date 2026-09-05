import type React from "react"
import type { Metadata } from "next"
import { Unbounded } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { MarketingIntercom } from "@/components/marketing-intercom"
import { PostHogProvider } from "@/components/posthog-provider"
import { EASNER_CANONICAL_DEFINITION_SHORT, EASNER_PRIMARY_KEYWORDS, EASNER_SUPPORTING_KEYWORDS } from "@/lib/marketing/constants"
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
  keywords: [...EASNER_PRIMARY_KEYWORDS, ...EASNER_SUPPORTING_KEYWORDS].join(", "),
  formatDetection: { email: false, address: false, telephone: false },
  applicationName: "Easner",
  metadataBase: new URL("https://www.easner.com"),
  manifest: "/manifest.webmanifest",
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
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
      </head>
      <body className={`${unbounded.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans`} suppressHydrationWarning>
        <PostHogProvider>
          {children}
          <MarketingIntercom />
        </PostHogProvider>
      </body>
    </html>
  )
}
