import { SplitSection } from "./split-section"
import { CorridorCoverageVisual } from "./corridor-coverage-visual"
import { corridorContent } from "@/lib/marketing/content/home"

export function CorridorStory() {
  return (
    <SplitSection
      headline={corridorContent.headline}
      body={corridorContent.body}
      bullets={corridorContent.bullets}
      visual={<CorridorCoverageVisual className="aspect-[4/5] w-full sm:aspect-[4/3]" />}
    />
  )
}
