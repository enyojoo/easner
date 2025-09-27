import type React from "react"
import type { Metadata } from "next"
import { Poppins, Unbounded } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { PostHogProvider } from "@/components/posthog-provider"
import { ClientErrorBoundary } from "@/components/client-error-boundary"
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

export const metadata: Metadata = {
  title: "Easner - Send Money | International Money Transfer",
  description:
    "Transfer money between supported currencies with the best exchange rates and zero fees. Send money abroad and make international money transfer online for free with Easner.",
  keywords:
    "money transfer, send money abroad, international payments, send money app, transfer money overseas, international money transfer, transfer money online, send money online",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.easner.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "https://cldup.com/iMvs-lKmIe.svg",
    shortcut: "https://cldup.com/iMvs-lKmIe.svg",
    apple: "https://cldup.com/iMvs-lKmIe.svg",
  },
  openGraph: {
    title: "Easner - Send Money | International Money Transfer",
    description:
      "Transfer money between supported currencies with the best exchange rates and zero fees. Send money abroad and make international money transfer online for free with Easner.",
    url: "https://www.easner.com",
    siteName: "Easner",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/EASNERwh.png",
        width: 1200,
        height: 630,
        alt: "Easner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Easner - Send Money | International Money Transfer",
    description:
      "Transfer money between supported currencies with the best exchange rates and zero fees. Send money abroad and make international money transfer online for free with Easner.",
    creator: "@easnerapp",
    images: ["https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/EASNERwh.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${poppins.variable} ${unbounded.variable} font-sans`} suppressHydrationWarning>
        <ClientErrorBoundary>
          <PostHogProvider>
            <AuthProvider>{children}</AuthProvider>
          </PostHogProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  )
}
