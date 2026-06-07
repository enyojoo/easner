import type { Metadata } from "next"
import { TermsPolicyPage } from "@/components/legal/terms-content"

export const metadata: Metadata = {
  title: "Terms of Service – Easner",
  description: "Terms of Service for Easner Personal, Easner Business, and related financial technology services.",
}

export default function TermsPage() {
  return <TermsPolicyPage />
}
