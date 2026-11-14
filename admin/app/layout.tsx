import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/lib/auth-context"
import { AdminQueryProvider } from "@/components/providers"
import { DesktopMinViewportGate } from "@/components/layout/desktop-min-viewport-gate"
import { AdminShellGate } from "@/components/layout/admin-shell-gate"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Easner Blog Admin", template: "%s – Easner Blog Admin" },
  description: "Easner Blog Admin",
  metadataBase: new URL("https://admin.easner.com"),
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
  },
  robots: { index: false, follow: false, nocache: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The background token (brand ivory); browser chrome needs a literal colour.
  // eslint-disable-next-line no-restricted-syntax
  themeColor: "#F6F3EB",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <AdminQueryProvider>
            <TooltipProvider delayDuration={300}>
              <DesktopMinViewportGate>
                <AdminShellGate>{children}</AdminShellGate>
                <Toaster />
              </DesktopMinViewportGate>
            </TooltipProvider>
          </AdminQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
