import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ClientAuthProvider } from "@/components/client-auth-provider"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Easner Banking",
  description: "Modern banking built on Column infrastructure",
  generator: "v0.app",
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <ClientAuthProvider>{children}</ClientAuthProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
