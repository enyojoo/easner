import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KYC/KYB Policy - Easner",
  description: "Learn about Easner's Know Your Customer (KYC) and Know Your Business (KYB) verification procedures. Understand our compliance requirements, document requirements, and verification process.",
  keywords: "KYC policy, KYB policy, know your customer, know your business, identity verification, compliance, financial services verification, KYC requirements",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "KYC/KYB Policy - Easner",
    description: "Learn about Easner's Know Your Customer (KYC) and Know Your Business (KYB) verification procedures. Understand our compliance requirements, document requirements, and verification process.",
    url: "https://www.easner.com/kyc-policy",
  },
  twitter: {
    title: "KYC/KYB Policy - Easner",
    description: "Learn about Easner's Know Your Customer (KYC) and Know Your Business (KYB) verification procedures. Understand our compliance requirements, document requirements, and verification process.",
  },
  alternates: {
    canonical: "/kyc-policy",
  },
}

export default function KYCPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

