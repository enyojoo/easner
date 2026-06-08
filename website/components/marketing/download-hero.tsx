"use client"

import { motion } from "framer-motion"
import { downloadHero } from "@/lib/marketing/content/download"

export function DownloadHero() {
  return (
    <section className="px-4 pb-6 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="text-balance font-unbounded text-[1.75rem] font-semibold leading-tight text-[#0F1110] sm:text-4xl md:text-5xl">
          {downloadHero.headline}
        </h1>
        <p className="mt-4 text-pretty text-[0.9375rem] leading-7 text-[#5F665F] sm:mt-5 sm:text-lg sm:leading-8">
          {downloadHero.subhead}
        </p>
      </motion.div>
    </section>
  )
}
