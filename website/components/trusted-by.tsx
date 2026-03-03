"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { TRUSTED_BY_LOGOS } from "@/lib/trusted-by-logos"

interface TrustedByProps {
  logos?: ReadonlyArray<{ src: string; alt: string }>
}

export function TrustedBy({ logos = TRUSTED_BY_LOGOS }: TrustedByProps) {
  const logoList = [...logos]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col items-center gap-6 pt-8 w-full"
    >
      <p className="text-sm sm:text-base text-gray-500 text-center">
        Loved by 2K+ most ambitious individuals and entrepreneurs.
      </p>
      {logoList.length > 0 && (
        <div className="relative w-full flex justify-center">
          {/* Framed viewport: shows ~4 logos at a time (Mercury-style), centered with fade edges */}
          <div className="relative overflow-hidden max-w-[480px] sm:max-w-[560px]">
            {/* Left fade - Mercury-style frame effect */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 sm:w-28 bg-gradient-to-r from-white via-white/50 to-transparent" />
            {/* Right fade */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 sm:w-28 bg-gradient-to-l from-white via-white/50 to-transparent" />
            {/* Visible area: ~4 logos (each ~140px) = 560px */}
            <div
              className="flex"
              style={{
                animation: `trusted-by-scroll ${logoList.length * 3}s linear infinite`,
                width: "max-content",
              }}
            >
              {[...logoList, ...logoList].map((logo, index) => (
                <div
                  key={index}
                  className="relative h-8 w-[120px] flex-shrink-0 flex items-center justify-center mx-5 sm:mx-6 opacity-60 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-200"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={32}
                    className="h-8 w-auto max-w-[100px] object-contain object-center"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
