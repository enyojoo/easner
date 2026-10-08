"use client"

import { motion } from "framer-motion"
import { aboutHero } from "@/lib/marketing/content/about"
import { MARKETING_BODY_TEXT } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"
import { Headline } from "@/components/ds/headline"

export function AboutHero() {
  return (
    <section className="px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 md:pt-14 lg:px-8 lg:pb-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl text-center"
      >
        <Headline level="page">
          {aboutHero.headlineLines.map((line, index) => (
            <span key={line} className="block">
              {index > 0 && " "}
              {line}
            </span>
          ))}
        </Headline>
        <p className={cn("mx-auto mt-4 max-w-2xl text-pretty text-web-body sm:mt-5", MARKETING_BODY_TEXT)}>
          {aboutHero.subhead}
        </p>
      </motion.div>
    </section>
  )
}
