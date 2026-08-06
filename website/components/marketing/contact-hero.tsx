"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CONTACT_EMAIL } from "@/lib/marketing/constants"
import { contactBooking, contactHero, contactSupport } from "@/lib/marketing/content/contact"
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
        <div className="mt-5 space-y-2 text-sm leading-6 text-[#6F756F] sm:mt-6 sm:text-base sm:leading-7">
          <p className="text-pretty">
            <strong className="font-semibold text-[#3D403D]">{contactHero.prospectPreface}</strong>{" "}
            <Link
              href={`#${contactBooking.anchor}`}
              className="font-semibold text-[#007ACC] hover:underline"
            >
              {contactHero.prospectLinkLabel}
            </Link>
            .
          </p>
          <p className="text-pretty">
            <strong className="font-semibold text-[#3D403D]">{contactHero.customerPreface}</strong>{" "}
            <Link
              href={`#${contactSupport.anchor}`}
              className="font-semibold text-[#007ACC] hover:underline"
            >
              {contactHero.customerLinkLabel}
            </Link>
            .
          </p>
          <p className="text-pretty pt-1">
            {contactHero.emailPreface}{" "}
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-all font-semibold text-[#007ACC] hover:underline sm:break-normal"
            >
              {CONTACT_EMAIL}
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  )
}
