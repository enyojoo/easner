"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { CONTACT_PATH } from "@/lib/marketing/constants"

export function NotFoundActions() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Button asChild variant="primary" pill>
        <MarketingLink href="/" analyticsLocation="404_home" ctaLabel="Back to home">
          Back to home
        </MarketingLink>
      </Button>
      <Button
        asChild
        variant="outline"
        pill
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
