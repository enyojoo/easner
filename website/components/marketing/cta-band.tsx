import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CtaBandContent } from "@/lib/marketing/types"

interface CtaBandProps {
  content: CtaBandContent
}

export function CtaBand({ content }: CtaBandProps) {
  return (
    <section className="relative overflow-hidden bg-[#F6F3EB] pb-20 pt-10 md:pb-28 md:pt-14">
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
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#E4DED1] bg-white/85 px-6 py-12 text-center shadow-[0_18px_60px_rgba(15,17,16,0.08)] backdrop-blur sm:px-10 md:py-16">
          <h2 className="mb-6 font-unbounded text-3xl font-semibold leading-tight text-[#0F1110] md:text-4xl">
            {content.headline}
          </h2>
          {content.subhead && (
            <p className="mx-auto max-w-3xl text-lg leading-8 text-[#5F665F] md:text-xl">{content.subhead}</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {content.ctas.map((cta, i) => (
              <Button
                key={cta.label}
                asChild
                size="lg"
                variant={i === 0 ? "default" : "outline"}
                className={
                  i === 0
                    ? "h-12 rounded-full bg-[#007ACC] px-6 text-white shadow-[0_12px_30px_rgba(0,122,204,0.2)] hover:bg-[#0062A3]"
                    : "h-12 rounded-full border-[#D9D4C7] bg-white px-6 text-[#0F1110] hover:bg-[#F8F6F0]"
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
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
