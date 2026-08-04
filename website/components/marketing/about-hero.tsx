"use client"

import { motion } from "framer-motion"
import { aboutHero } from "@/lib/marketing/content/about"
import { MARKETING_PAGE_HERO_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

export function AboutHero() {
  return (
    <section className="px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className={cn("text-balance font-unbounded font-bold text-[#0F1110]", MARKETING_PAGE_HERO_TITLE)}>
          {aboutHero.headline}
        </h1>
        <p className="mt-4 text-pretty text-[0.9375rem] leading-7 text-[#5F665F] sm:mt-5 sm:text-lg sm:leading-8">
          {aboutHero.subhead}
        </p>
        <p className="mt-4 text-pretty text-sm font-semibold leading-6 text-[#3D443E] sm:mt-5 sm:text-base sm:leading-7">
          {aboutHero.microLine}
        </p>
      </motion.div>
    </section>
  )
}
