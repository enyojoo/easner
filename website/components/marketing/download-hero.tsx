"use client"

import { motion } from "framer-motion"
import { downloadHero } from "@/lib/marketing/content/download"
import { MARKETING_BODY_TEXT, MARKETING_PAGE_HERO_TITLE } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

export function DownloadHero() {
  return (
    <section className="px-4 pb-6 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className={cn("text-balance font-unbounded font-bold text-[#0F1110]", MARKETING_PAGE_HERO_TITLE)}>
          {downloadHero.headline}
        </h1>
        <p className={cn("mt-4 text-pretty text-[#5F665F] sm:mt-5", MARKETING_BODY_TEXT)}>
          {downloadHero.subhead}
        </p>
      </motion.div>
    </section>
  )
}
