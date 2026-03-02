import type React from "react"
import type { Metadata } from "next"
import { Poppins, Unbounded } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
})

const geistSans = GeistSans

export const metadata: Metadata = {
  title: "Easner - Move Money Globally Like SMS",
  description:
    "API-first cross-border payment infrastructure for US and EU businesses, with built-in KYC/AML compliance. For individuals and businesses.",
  keywords:
    "instant money transfer, bank to bank transfer, cross border payments, international money transfer, zero fee transfer, US fintech, business banking, global payments",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://www.easner.com"),
  alternates: { canonical: "/" },
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
    shortcut: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
    apple: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
  },
  openGraph: {
    title: "Easner - Move Money Globally Like SMS",
    description: "API-first cross-border payment infrastructure for US and EU businesses.",
    url: "https://www.easner.com",
    siteName: "Easner",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/easner%20seo%20cover.png",
        width: 1200,
        height: 630,
        alt: "Easner - Global Money Transfer Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Easner - Move Money Globally Like SMS",
    description: "API-first cross-border payment infrastructure for US and EU businesses.",
    creator: "@easner",
    images: ["https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/easner%20seo%20cover.png"],
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
      <body className={`${poppins.variable} ${unbounded.variable} ${geistSans.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
