"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CONTACT_EMAIL } from "@/lib/marketing/constants"
import { contactHero } from "@/lib/marketing/content/contact"

export function ContactHero() {
  return (
    <section className="px-4 pb-10 pt-10 sm:px-6 sm:pb-12 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="font-unbounded text-3xl font-semibold leading-tight text-[#0F1110] sm:text-4xl md:text-5xl">
          {contactHero.headline}
        </h1>
        <p className="mt-5 text-base leading-8 text-[#5F665F] sm:text-lg">{contactHero.subhead}</p>
        <p className="mt-4 text-sm leading-6 text-[#6F756F]">
          Prefer email?{" "}
          <Link href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#007ACC] hover:underline">
            {CONTACT_EMAIL}
          </Link>
        </p>
      </motion.div>
    </section>
  )
}
