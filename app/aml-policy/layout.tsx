import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AML Policy - Easner",
  description: "Learn about Easner's Anti-Money Laundering (AML) policy and procedures. Understand our compliance measures, transaction monitoring, and suspicious activity reporting.",
  keywords: "AML policy, anti-money laundering, financial compliance, transaction monitoring, suspicious activity reporting, SAR, financial crime prevention",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AML Policy - Easner",
    description: "Learn about Easner's Anti-Money Laundering (AML) policy and procedures. Understand our compliance measures, transaction monitoring, and suspicious activity reporting.",
    url: "https://www.easner.com/aml-policy",
  },
  twitter: {
    title: "AML Policy - Easner",
    description: "Learn about Easner's Anti-Money Laundering (AML) policy and procedures. Understand our compliance measures, transaction monitoring, and suspicious activity reporting.",
  },
  alternates: {
    canonical: "/aml-policy",
  },
}

export default function AMLPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

