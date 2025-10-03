import type React from "react"
import type { Metadata } from "next"
import { Poppins, Unbounded } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { PostHogProvider } from "@/components/posthog-provider"
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
  title: "Easner: Zero-Fee International Money Transfer | Send Money Abroad Instantly",
  description:
    "Send money globally with zero fees using stablecoin technology. Instant transfers to 50+ countries. Save up to 15% vs traditional services. Trusted by diaspora families and businesses worldwide.",
  keywords:
    "zero fee money transfer, instant international transfer, send money abroad free, stablecoin money transfer, diaspora money transfer, send money to Nigeria, send money to Ghana, send money to Kenya, cheapest money transfer, crypto money transfer, business international payments, send money to Africa, instant money transfer, money transfer app, international payments, transfer money overseas, send money online",
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
    title: "Easner: Zero-Fee International Money Transfer | Send Money Abroad Instantly",
    description:
      "Send money globally with zero fees using stablecoin technology. Instant transfers to 50+ countries. Save up to 15% vs traditional services. Trusted by diaspora families and businesses worldwide.",
    url: "https://www.easner.com",
    siteName: "Easner",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20web%20app.png",
        width: 1200,
        height: 630,
        alt: "Easner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Easner: Zero-Fee International Money Transfer | Send Money Abroad Instantly",
    description:
      "Send money globally with zero fees using stablecoin technology. Instant transfers to 50+ countries. Save up to 15% vs traditional services. Trusted by diaspora families and businesses worldwide.",
    creator: "@easnerapp",
    images: ["https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20web%20app.png"],
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
                    "text": "Transfers are processed instantly using stablecoin technology. Money typically arrives in the recipient's bank account within minutes, not days like traditional services."
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
                    "text": "Yes, Easner uses bank-level security and stablecoin technology. All transfers are encrypted and processed through regulated financial institutions. Your money is always safe."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does Easner compare to Wise, Remitly, or WorldRemit?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Easner offers zero fees compared to 0.5-3% fees charged by competitors. We also provide instant transfers using stablecoin technology, while traditional services can take 1-3 business days."
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
              "description": "Zero-fee international money transfer service using stablecoin technology",
              "url": "https://www.easner.com",
              "logo": "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20web%20app.png",
              "serviceType": "Money Transfer",
              "areaServed": [
                { "@type": "Country", "name": "Nigeria" },
                { "@type": "Country", "name": "Ghana" },
                { "@type": "Country", "name": "Kenya" },
                { "@type": "Country", "name": "Uganda" },
                { "@type": "Country", "name": "South Africa" }
              ],
              "feesAndCommissionsSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Zero fees for international money transfers"
              },
              "offers": {
                "@type": "Offer",
                "description": "Instant international money transfers with zero fees",
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
      <body className={`${poppins.variable} ${unbounded.variable} font-sans`} suppressHydrationWarning>
        <PostHogProvider>
          <AuthProvider>{children}</AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
