"use client"

import { motion } from "framer-motion"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { CONTACT_EMAIL } from "@/lib/marketing/constants"
import { contactBooking, contactHero } from "@/lib/marketing/content/contact"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

export function ContactHero() {
  return (
    <section className="px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <Headline level="page" className="text-balance">
          {contactHero.headline}
        </Headline>
        <p className={cn("mt-4 text-pretty text-web-body sm:mt-5", MARKETING_BODY_TEXT)}>
          {contactHero.subhead}
        </p>
        <div className="mt-4 flex flex-col gap-3 text-center text-sm leading-6 text-web-meta sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2 sm:gap-y-1">
          <p className="text-pretty">
            <strong className="font-semibold text-web-nav">{contactHero.prospectPreface}</strong>{" "}
            <MarketingLink
              href={`#${contactBooking.anchor}`}
              analyticsLocation="contact_hero_booking"
              ctaLabel={contactHero.prospectLinkLabel}
              className="font-semibold text-brand-primary hover:underline"
            >
              {contactHero.prospectLinkLabel}
            </MarketingLink>
            .
          </p>
          <span aria-hidden="true" className="hidden text-brand-stone sm:inline">
            ·
          </span>
          <p className="text-pretty">
            {contactHero.emailPreface}{" "}
            <MarketingLink
              href={`mailto:${CONTACT_EMAIL}`}
              analyticsLocation="contact_hero_email"
              ctaLabel={CONTACT_EMAIL}
              className="break-all font-semibold text-brand-primary hover:underline sm:break-normal"
            >
              {CONTACT_EMAIL}
            </MarketingLink>
          </p>
        </div>
      </motion.div>
    </section>
  )
}
