import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Request Access - Easner",
  description: "Request access to Easner's cross-border payment infrastructure. For US and EU businesses.",
  keywords: "request access, cross border payments, API, business banking, international money transfer, fintech",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Request Access - Easner",
    description: "Request access to Easner's cross-border payment infrastructure. For US and EU businesses.",
    url: "https://www.easner.com/access",
  },
  twitter: {
    title: "Request Access - Easner",
    description: "Request access to Easner's cross-border payment infrastructure. For US and EU businesses.",
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
