"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OpenAccountButton } from "./open-account-dialog"
import { PersonaCtas } from "./persona-ctas"
import type { CtaBandContent } from "@/lib/marketing/types"
import { MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS } from "@/lib/marketing/layout-constants"
import { cn } from "@/lib/utils"

interface CtaBandProps {
  content: CtaBandContent
}

export function CtaBand({ content }: CtaBandProps) {
  return (
    <section className="relative overflow-hidden bg-[#F6F3EB] pb-16 pt-8 md:pb-28 md:pt-14">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `url('https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/worldmap.svg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mx-auto max-w-5xl rounded-[1.5rem] border border-[#E4DED1] bg-white/85 px-5 py-10 text-center shadow-[0_18px_60px_rgba(15,17,16,0.08)] backdrop-blur sm:rounded-[2rem] sm:px-10 md:py-16">
          <h2 className={cn("mb-5 font-unbounded font-bold text-[#0F1110] md:mb-6", MARKETING_DISPLAY_TITLE, MARKETING_HEADING_CAPS)}>
            {content.headline}
          </h2>
          {content.subhead && (
            <p className="mx-auto max-w-3xl text-base leading-7 text-[#5F665F] sm:text-lg sm:leading-8 md:text-xl">{content.subhead}</p>
          )}
          {content.ctas.some((cta) => cta.store) ? (
            <div className="mx-auto mt-8 flex max-w-md justify-center">
              <PersonaCtas ctas={content.ctas} storeLayout="grid" className="w-full" />
            </div>
          ) : (
            <div className="mt-8 flex flex-row flex-wrap items-center justify-center gap-3">
              {content.ctas.map((cta, i) =>
                cta.action === "open-account" ? (
                  <OpenAccountButton
                    key={cta.label}
                    showArrow
                    className="h-11 rounded-full bg-[#007ACC] px-5 text-sm text-white shadow-[0_12px_30px_rgba(0,122,204,0.2)] hover:bg-[#0062A3] sm:h-12 sm:px-6"
                  />
                ) : (
                  <Button
                    key={cta.label}
                    asChild
                    size="lg"
                    variant={i === 0 ? "default" : "outline"}
                    className={
                      i === 0
                        ? "h-11 rounded-full bg-[#007ACC] px-5 text-sm text-white shadow-[0_12px_30px_rgba(0,122,204,0.2)] hover:bg-[#0062A3] sm:h-12 sm:px-6"
                        : "h-11 rounded-full border-[#D9D4C7] bg-white px-5 text-sm text-[#0F1110] hover:bg-[#F8F6F0] sm:h-12 sm:px-6"
                    }
                  >
                    <Link
                      href={cta.href}
                      target={cta.external ? "_blank" : undefined}
                      rel={cta.external ? "noopener noreferrer" : undefined}
                    >
                      {cta.label}
                      {i === 0 && !cta.external && <ArrowRight className="h-4 w-4" />}
                    </Link>
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
