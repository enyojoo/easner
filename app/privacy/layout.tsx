import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Easner",
  description: "Learn how Easner protects your personal and financial data. Our privacy policy covers data collection, security measures, and your rights for international money transfers.",
  keywords: "privacy policy, data protection, financial security, personal data, GDPR compliance, money transfer privacy, data security",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy - Easner",
    description: "Learn how Easner protects your personal and financial data. Our privacy policy covers data collection, security measures, and your rights for international money transfers.",
    url: "https://www.easner.com/privacy",
  },
  twitter: {
    title: "Privacy Policy - Easner",
    description: "Learn how Easner protects your personal and financial data. Our privacy policy covers data collection, security measures, and your rights for international money transfers.",
  },
  alternates: {
    canonical: "/privacy",
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
