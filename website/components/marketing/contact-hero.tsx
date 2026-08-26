"use client"

import { motion } from "framer-motion"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { CONTACT_EMAIL } from "@/lib/marketing/constants"
import { contactBooking, contactHero } from "@/lib/marketing/content/contact"
import { MARKETING_PAGE_HERO_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

export function ContactHero() {
  return (
    <section className="px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className={cn("text-balance font-unbounded font-bold text-[#0F1110]", MARKETING_PAGE_HERO_TITLE)}>
          {contactHero.headline}
        </h1>
        <p className="mt-4 text-pretty text-[0.9375rem] leading-7 text-[#5F665F] sm:mt-5 sm:text-lg sm:leading-8">
          {contactHero.subhead}
        </p>
        <div className="mt-4 flex flex-col gap-3 text-center text-sm leading-6 text-[#6F756F] sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2 sm:gap-y-1">
          <p className="text-pretty">
            <strong className="font-semibold text-[#3D403D]">{contactHero.prospectPreface}</strong>{" "}
            <MarketingLink
              href={`#${contactBooking.anchor}`}
              analyticsLocation="contact_hero_booking"
              ctaLabel={contactHero.prospectLinkLabel}
              className="font-semibold text-[#007ACC] hover:underline"
            >
              {contactHero.prospectLinkLabel}
            </MarketingLink>
            .
          </p>
          <span aria-hidden="true" className="hidden text-[#C8C2B6] sm:inline">
            ·
          </span>
          <p className="text-pretty">
            {contactHero.emailPreface}{" "}
            <MarketingLink
              href={`mailto:${CONTACT_EMAIL}`}
              analyticsLocation="contact_hero_email"
              ctaLabel={CONTACT_EMAIL}
              className="break-all font-semibold text-[#007ACC] hover:underline sm:break-normal"
            >
              {CONTACT_EMAIL}
            </MarketingLink>
          </p>
        </div>
      </motion.div>
    </section>
  )
}
