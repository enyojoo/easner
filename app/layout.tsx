import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { PostHogProvider } from "@/components/posthog-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NOVAMONEY - Send Money Instantly",
  description: "Transfer money between supported currencies with the best exchange rates and zero fees",
  keywords: "money transfer, currency exchange, international payments, remittance",
  authors: [{ name: "NOVAMONEY" }],
  creator: "NOVAMONEY",
  publisher: "NOVAMONEY",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.novamoney.net"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NOVAMONEY - Send Money Instantly",
    description: "Transfer money between supported currencies with the best exchange rates and zero fees",
    url: "https://www.novamoney.net",
    siteName: "NOVAMONEY",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOVAMONEY - Send Money Instantly",
    description: "Transfer money between supported currencies with the best exchange rates and zero fees",
    creator: "@novamoneyapp",
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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PostHogProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
