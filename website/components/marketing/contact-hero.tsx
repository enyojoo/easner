"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CONTACT_EMAIL } from "@/lib/marketing/constants"
import { contactHero, contactSupport } from "@/lib/marketing/content/contact"

export function ContactHero() {
  return (
    <section className="px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="text-balance font-unbounded text-[1.75rem] font-semibold leading-tight text-[#0F1110] sm:text-4xl md:text-5xl">
          {contactHero.headline}
        </h1>
        <p className="mt-4 text-pretty text-[0.9375rem] leading-7 text-[#5F665F] sm:mt-5 sm:text-lg sm:leading-8">
          {contactHero.subhead}
        </p>
        <div className="mt-4 flex flex-col gap-3 text-center text-sm leading-6 text-[#6F756F] sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2 sm:gap-y-1">
          <p className="text-pretty">
            {contactHero.emailPreface}{" "}
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="break-all font-semibold text-[#007ACC] hover:underline sm:break-normal"
            >
              {CONTACT_EMAIL}
            </Link>
          </p>
          <span aria-hidden="true" className="hidden text-[#C8C2B6] sm:inline">
            ·
          </span>
          <p className="text-pretty">
            {contactHero.supportPreface}{" "}
            <Link href={`#${contactSupport.anchor}`} className="font-semibold text-[#007ACC] hover:underline">
              {contactHero.supportLinkLabel}
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  )
}
