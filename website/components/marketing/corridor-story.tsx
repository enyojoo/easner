"use client"

import { cn } from "@/lib/utils"
import {
  SPLIT_COPY_CARD,
  SPLIT_GRID_GAP,
  SPLIT_VISUAL_CONTAINER,
} from "@/lib/marketing/layout-constants"
import { VisualSlot } from "./visual-slot"
import { OpenAccountButton } from "./open-account-dialog"
import { corridorContent } from "@/lib/marketing/content/home"

export function CorridorStory() {
  return (
    <section className="bg-white pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("grid grid-cols-1 items-stretch lg:grid-cols-2", SPLIT_GRID_GAP)}>
          <div className={SPLIT_COPY_CARD}>
            <h3 className="font-unbounded text-2xl font-semibold leading-tight text-[#0F1110] sm:text-3xl">
              {corridorContent.headline}
            </h3>
            <p className="mt-4 flex-1 text-lg leading-8 text-[#5F665F]">{corridorContent.body}</p>
            {corridorContent.ctas && corridorContent.ctas.length > 0 && (
              <div className="mt-8 min-h-[3.25rem] shrink-0">
                <OpenAccountButton
                  showArrow
                  className="h-12 rounded-full bg-[#007ACC] px-6 text-white hover:bg-[#0062A3]"
                />
              </div>
            )}
          </div>
          <div className={SPLIT_VISUAL_CONTAINER}>
            <VisualSlot
              assetId={corridorContent.visualSlot}
              alt={corridorContent.altText}
              aspect="fill"
              className="h-full rounded-none border-0 bg-transparent shadow-none"
              preload
            />
          </div>
        </div>
      </div>
    </section>
  )
}
