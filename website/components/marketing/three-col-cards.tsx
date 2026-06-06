import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VisualSlot } from "./visual-slot"
import type { CardItem } from "@/lib/marketing/types"

interface ThreeColCardsProps {
  headline?: string
  subhead?: string
  headlineClassName?: string
  items: CardItem[]
  columns?: 2 | 3 | 4
  showIcons?: boolean
  id?: string
  className?: string
}

export function ThreeColCards({
  headline,
  subhead,
  headlineClassName,
  items,
  columns = 3,
  showIcons = false,
  id,
  className,
}: ThreeColCardsProps) {
  const gridClass =
    columns === 4
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      : columns === 2
        ? "mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
        : "grid grid-cols-1 md:grid-cols-3 gap-6"

  return (
    <section id={id} className={cn("bg-[#F6F3EB] pb-16 pt-8 md:pb-24 md:pt-12", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {headline && (
          <div className="mx-auto mb-12 max-w-3xl text-center lg:max-w-none">
            <h2
              className={`font-unbounded text-3xl font-semibold leading-tight text-[#0F1110] sm:text-4xl ${headlineClassName ?? ""}`}
            >
              {headline}
            </h2>
            {subhead && <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#5F665F]">{subhead}</p>}
          </div>
        )}
        <div className={gridClass}>
          {items.map((item) => {
            const content = (
              <Card className="group h-full overflow-hidden rounded-[1.5rem] border-[#E4DED1] bg-white/90 shadow-[0_12px_35px_rgba(15,17,16,0.05)] transition-all hover:-translate-y-1 hover:border-[#007ACC]/30 hover:shadow-[0_20px_55px_rgba(15,17,16,0.09)]">
                {showIcons && item.icon && (
                  <div className="px-6 pt-6">
                    <VisualSlot assetId={item.icon} alt={item.title} aspect="square" className="h-16 w-16 !aspect-square rounded-2xl shadow-none" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg font-semibold leading-snug text-[#0F1110]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-[#5F665F]">{item.description}</p>
                </CardContent>
              </Card>
            )

            if (item.link) {
              return (
                <Link key={item.title} href={item.link} className="block h-full">
                  {content}
                </Link>
              )
            }

            return <div key={item.title}>{content}</div>
          })}
        </div>
      </div>
    </section>
  )
}
