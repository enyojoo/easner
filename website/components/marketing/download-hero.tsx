"use client"

import { motion } from "framer-motion"
import { downloadHero } from "@/lib/marketing/content/download"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

export function DownloadHero() {
  return (
    <section className="px-4 pb-6 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <Headline level="page" className="text-balance">
          {downloadHero.headline}
        </Headline>
        <p className={cn("mt-4 text-pretty text-web-body sm:mt-5", MARKETING_BODY_TEXT)}>
          {downloadHero.subhead}
        </p>
      </motion.div>
    </section>
  )
}
