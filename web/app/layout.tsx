import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/lib/auth-context"
import { PostHogProvider } from "@/components/posthog-provider"
import { ProtectedRouteWrapper } from "@/components/auth/protected-route-wrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "Easner - Move Money Globally Like SMS",
  description:
    "API-first cross-border payment infrastructure for US and EU businesses, with built-in KYC/AML compliance. For individuals and businesses.",
  keywords:
    "instant money transfer, bank to bank transfer, cross border payments, international money transfer, zero fee transfer, US fintech, business banking, global payments, US EU Africa Asia transfers, instant cross border transfer, fiat to fiat transfer, business international payments, treasury FX, compliance gateway, money transfer API",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://app.easner.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
    shortcut: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
    apple: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Favicon.svg",
  },
  openGraph: {
    title: "Easner - Move Money Globally Like SMS",
    description:
      "API-first cross-border payment infrastructure for US and EU businesses, with built-in KYC/AML compliance. For individuals and businesses.",
    url: "https://app.easner.com",
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
    description:
      "API-first cross-border payment infrastructure for US and EU businesses, with built-in KYC/AML compliance. For individuals and businesses.",
    creator: "@easner",
    images: ["https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/easner%20seo%20cover.png"],
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How much does it cost to send money with Easner?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Easner charges zero fees for international money transfers. You only pay the real-time exchange rate with no hidden costs, saving you up to 15% compared to traditional services."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How fast are international money transfers?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Transfers are processed instantly using real-time settlement infrastructure. Money typically arrives in the recipient's bank account within minutes, not days like traditional services."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Which countries can I send money to?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Currently, we support transfers to Nigeria, Ghana, Kenya, Uganda, and South Africa. We're constantly expanding to more countries to serve the global diaspora community."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is it safe to send money with Easner?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Easner uses bank-level security. All transfers are encrypted and processed through regulated financial institutions. Your money is always safe."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does Easner compare to Wise, Remitly, or WorldRemit?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Easner offers zero fees compared to 0.5-3% fees charged by competitors. We also provide instant transfers, while traditional services can take 1-3 business days."
                  }
                }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "Easner",
              "description": "Technology platform facilitating instant cross-border money transfers. API-first cross-border payment infrastructure for US and EU businesses.",
              "url": "https://www.easner.com",
              "logo": "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20web%20app.png",
              "serviceType": "Money Transfer",
              "areaServed": [
                { "@type": "Country", "name": "Nigeria" },
                { "@type": "Country", "name": "Ghana" },
                { "@type": "Country", "name": "Kenya" },
                { "@type": "Country", "name": "Uganda" },
                { "@type": "Country", "name": "South Africa" },
                { "@type": "Country", "name": "European Union" }
              ],
              "feesAndCommissionsSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Zero fees for international money transfers"
              },
              "offers": {
                "@type": "Offer",
                "description": "Instant bank-to-bank international money transfers with zero fees.",
                "price": "0",
                "priceCurrency": "USD"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Money Transfer Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Send Money to Nigeria",
                      "description": "Zero-fee money transfer to Nigeria"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Send Money to Ghana",
                      "description": "Zero-fee money transfer to Ghana"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Send Money to Kenya",
                      "description": "Zero-fee money transfer to Kenya"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
<PostHogProvider>
        <AuthProvider>
          <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>
        </AuthProvider>
      </PostHogProvider>
      </body>
    </html>
  )
}
