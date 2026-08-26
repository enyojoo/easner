"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { CONTACT_PATH } from "@/lib/marketing/constants"

export function NotFoundActions() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Button asChild className="h-12 rounded-full bg-[#007ACC] px-6 text-white hover:bg-[#0062A3]">
        <MarketingLink href="/" analyticsLocation="404_home" ctaLabel="Back to home">
          Back to home
        </MarketingLink>
      </Button>
      <Button
        asChild
        variant="outline"
        className="h-12 rounded-full border-[#D9D4C7] bg-white px-6 text-[#0F1110] hover:bg-white"
      >
        <MarketingLink
          href={CONTACT_PATH}
          analyticsLocation="404_contact"
          ctaLabel="Contact us"
        >
          Contact us
        </MarketingLink>
      </Button>
    </div>
  )
}
