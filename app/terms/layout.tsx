import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Easner",
  description: "Read Easner's terms of service for international money transfers. Learn about our zero-fee policy, user responsibilities, and service conditions.",
  keywords: "terms of service, easner terms, money transfer terms, international transfer conditions, user agreement, service terms",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Service - Easner",
    description: "Read Easner's terms of service for international money transfers. Learn about our zero-fee policy, user responsibilities, and service conditions.",
    url: "https://www.easner.com/terms",
  },
  twitter: {
    title: "Terms of Service - Easner",
    description: "Read Easner's terms of service for international money transfers. Learn about our zero-fee policy, user responsibilities, and service conditions.",
  },
  alternates: {
    canonical: "/terms",
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
