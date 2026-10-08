"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OpenAccountButton } from "./open-account-dialog"
import { MarketingLink } from "./marketing-link"
import { PersonaCtas } from "./persona-ctas"
import type { CtaBandContent } from "@/lib/marketing/types"
import { usePersonalBankingCtaDescription } from "@/hooks/use-download-platform"
import { CtaPanel } from "@/components/ds/cta-panel"

interface CtaBandProps {
  content: CtaBandContent
}

export function CtaBand({ content }: CtaBandProps) {
  const personalDescription = usePersonalBankingCtaDescription()
  const hasStoreCtas = content.ctas.some((cta) => cta.store)
  const subhead = content.subhead ?? (hasStoreCtas ? personalDescription : undefined)

  return (
    <CtaPanel
      headline={content.headline}
      subhead={subhead}
      actions={
        hasStoreCtas ? (
          <div className="mx-auto mt-8 flex max-w-md justify-center">
            <PersonaCtas ctas={content.ctas} className="w-full" align="center" description={false} />
          </div>
        ) : (
          <div className="mt-8 flex flex-row flex-wrap items-center justify-center gap-3">
            {content.ctas.map((cta, i) =>
              cta.action === "open-account" ? (
                <OpenAccountButton
                  key={cta.label}
                  ctaLocation={cta.analyticsLocation}
                  showArrow
                />
              ) : (
                <Button
                  key={cta.label}
                  asChild
                  variant={i === 0 ? "primary" : "outline"}
                  pill
                >
                  <MarketingLink
                    href={cta.href}
                    external={cta.external}
                    analyticsLocation={cta.analyticsLocation}
                    ctaLabel={cta.label}
                  >
                    {cta.label}
                    {i === 0 && !cta.external && <ArrowRight className="h-4 w-4" />}
                  </MarketingLink>
                </Button>
              )
            )}
          </div>
        )
      }
    />
  )
}
