import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"
import { ClientAuthProvider } from "@/components/client-auth-provider"
import { ChunkLoadErrorHandler } from "@/components/chunk-load-error-handler"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Easner Business Banking",
  description: "Easner Business Banking - Modern banking built on Column infrastructure",
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
        <ChunkLoadErrorHandler />
        <Suspense fallback={<LoadingSpinner />}>
          <ClientAuthProvider>{children}</ClientAuthProvider>
          <Toaster />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
