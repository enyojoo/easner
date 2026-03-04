import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/lib/auth-context"
import { ProtectedRouteWrapper } from "@/components/auth/protected-route-wrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "Easner Office",
  description: "Easner back office",
  metadataBase: new URL("https://bk.easner.com"),
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
        <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>
      </AuthProvider>
      </body>
    </html>
  )
}
