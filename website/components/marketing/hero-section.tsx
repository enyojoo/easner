"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { VisualSlot } from "./visual-slot"
import { OpenAccountButton } from "./open-account-dialog"
import { homeHero } from "@/lib/marketing/content/home"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-10 sm:px-6 sm:pb-16 md:pt-14 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl text-center"
        >
          <div className="space-y-5">
            <h1 className="mx-auto w-full font-unbounded text-3xl font-semibold leading-[1.08] text-[#0F1110] sm:text-4xl md:text-5xl lg:text-6xl">
              {homeHero.h1Lines.map((line, index) => (
                <span
                  key={line}
                  className={index === 1 ? "block text-[#007ACC] lg:whitespace-nowrap" : "block lg:whitespace-nowrap"}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-[#5F665F] sm:text-lg">
              {homeHero.subhead}
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <OpenAccountButton
              showArrow
              className="h-12 rounded-full bg-[#007ACC] px-6 text-white shadow-[0_12px_30px_rgba(0,122,204,0.22)] hover:bg-[#0062A3]"
            />
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-[#D9D4C7] bg-white/75 px-6 text-[#0F1110] hover:bg-white"
              asChild
            >
              <Link href={homeHero.ctas[1].href}>{homeHero.ctas[1].label}</Link>
            </Button>
          </div>
        </motion.div>
        <div className="relative z-10 mx-auto mt-12 max-w-6xl">
          <VisualSlot
            assetId={homeHero.visualSlot}
            alt={homeHero.altText}
            aspect="hero"
          />
        </div>
      </div>
    </section>
  )
}
