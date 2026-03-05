import type { Metadata } from "next"
import { businessInfo } from "@/lib/business-info"

export const metadata: Metadata = {
  title: `Pay - ${businessInfo.name}`,
  description: `Complete your payment to ${businessInfo.name}`,
}

export default function PayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
