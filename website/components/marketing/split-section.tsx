import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisualSlot } from "./visual-slot"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import type { Cta } from "@/lib/marketing/types"

interface SplitSectionProps {
  headline: string
  body?: string
  bullets?: string[]
  visualSlot?: string
  altText?: string
  visual?: ReactNode
  reverse?: boolean
  badge?: string
  ctas?: Cta[]
  h1?: boolean
  subhead?: string
  narrow?: boolean
}

export function SplitSection({
  headline,
  body,
  bullets,
  visualSlot,
  altText,
  visual,
  reverse = false,
  badge,
  ctas,
  h1 = false,
  subhead,
  narrow = false,
}: SplitSectionProps) {
  const HeadingTag = h1 ? "h1" : "h2"

  return (
    <section className={cn("bg-[#F6F3EB] pb-16 pt-8 md:pb-24 md:pt-12", h1 ? "bg-transparent" : "")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-10 lg:gap-16 ${
            narrow ? "lg:grid-cols-5" : "lg:grid-cols-2"
          } ${h1 ? "items-center" : "items-start"} ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
        >
          <div className={cn(narrow ? "lg:col-span-2" : "", h1 ? "" : "lg:pt-6")}>
            {badge && <StatusBadge label={badge} className="mb-4" />}
            <HeadingTag
              className={`font-unbounded font-semibold text-[#0F1110] leading-[1.08] ${
                h1 ? "text-4xl sm:text-5xl md:text-6xl" : "text-3xl sm:text-4xl"
              }`}
            >
              {headline}
            </HeadingTag>
            {subhead && (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5F665F] sm:text-xl">{subhead}</p>
            )}
            {body && (
              <p className={`max-w-2xl text-[#5F665F] leading-8 ${subhead ? "mt-4" : "mt-5 text-lg"}`}>
                {body}
              </p>
            )}
            {bullets && bullets.length > 0 && (
              <ul className="mt-7 space-y-3">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-[#3D443E]">
                    <span className="mt-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF5FD]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#007ACC]" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            {ctas && ctas.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {ctas.map((cta, i) => (
                  <Button
                    key={cta.label}
                    asChild
                    size="lg"
                    variant={i === 0 ? "default" : "outline"}
                    className={
                      i === 0
                        ? "h-12 rounded-full bg-[#007ACC] px-6 text-white shadow-[0_12px_30px_rgba(0,122,204,0.18)] hover:bg-[#0062A3]"
                        : "h-12 rounded-full border-[#D9D4C7] bg-white/80 px-6 text-[#0F1110] hover:bg-white"
                    }
                  >
                    <Link
                      href={cta.href}
                      target={cta.external && cta.href !== "#" ? "_blank" : undefined}
                      rel={cta.external && cta.href !== "#" ? "noopener noreferrer" : undefined}
                      onClick={cta.href === "#" ? (event) => event.preventDefault() : undefined}
                    >
                      {cta.label}
                      {i === 0 && !cta.external && <ArrowRight className="h-4 w-4" />}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
          {(visual || (visualSlot && altText)) && (
            <div className={narrow ? "lg:col-span-3" : ""}>
              {visual ?? (
                <VisualSlot assetId={visualSlot!} alt={altText!} aspect={h1 ? "hero" : "feature"} />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
