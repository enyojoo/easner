import type React from "react"
import type { Metadata } from "next"
import { Unbounded } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { MarketingIntercom } from "@/components/marketing-intercom"
import { PostHogProvider } from "@/components/posthog-provider"
import { homeMetadata } from "@/lib/marketing/content/home"
import "./globals.css"

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
})

export const metadata: Metadata = {
  title: {
    default: homeMetadata.title,
    template: "%s – Easner",
  },
  description: homeMetadata.description,
  keywords: homeMetadata.keywords,
  formatDetection: { email: false, address: false, telephone: false },
  applicationName: "Easner",
  metadataBase: new URL("https://www.easner.com"),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: homeMetadata.title,
    description: homeMetadata.description,
    url: "https://www.easner.com",
    siteName: "Easner",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@easnerbanking",
    title: homeMetadata.title,
    description: homeMetadata.description,
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
