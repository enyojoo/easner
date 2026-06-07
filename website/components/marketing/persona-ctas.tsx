"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StoreDownloadButtons } from "./store-download-buttons"
import type { Cta } from "@/lib/marketing/types"

interface PersonaCtasProps {
  ctas: Cta[]
  className?: string
  storeLayout?: "row" | "column" | "grid"
}

export function PersonaCtas({ ctas, className, storeLayout = "row" }: PersonaCtasProps) {
  const hasStoreCtas = ctas.some((cta) => cta.store)

  if (hasStoreCtas) {
    return <StoreDownloadButtons className={className} layout={storeLayout} />
  }

  return (
    <div className={cn("flex flex-row flex-wrap gap-3", className)}>
      {ctas.map((cta, i) => (
        <Button
          key={cta.label}
          asChild
          size="lg"
          variant={i === 0 ? "default" : "outline"}
          className={
            i === 0
              ? "h-11 rounded-full bg-[#007ACC] px-5 text-sm text-white hover:bg-[#0062A3] sm:h-12 sm:px-6"
              : "h-11 rounded-full border-[#D9D4C7] bg-white px-5 text-sm text-[#0F1110] hover:bg-white sm:h-12 sm:px-6"
          }
        >
          <Link
            href={cta.href}
            target={cta.external ? "_blank" : undefined}
            rel={cta.external ? "noopener noreferrer" : undefined}
          >
            {cta.label}
          </Link>
        </Button>
      ))}
    </div>
  )
}
