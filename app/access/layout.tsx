import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Early Access - Easner",
  description: "Get early access to Easner's zero-fee international money transfer service. Join the waitlist and be among the first to experience instant, fee-free transfers.",
  keywords: "early access, easner waitlist, money transfer early access, zero fee transfer, international money transfer, join waitlist",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Early Access - Easner",
    description: "Get early access to Easner's zero-fee international money transfer service. Join the waitlist and be among the first to experience instant, fee-free transfers.",
    url: "https://www.easner.com/access",
  },
  twitter: {
    title: "Early Access - Easner",
    description: "Get early access to Easner's zero-fee international money transfer service. Join the waitlist and be among the first to experience instant, fee-free transfers.",
  },
  alternates: {
    canonical: "/access",
  },
}

export default function AccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
