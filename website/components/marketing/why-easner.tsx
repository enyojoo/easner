import { ThreeColCards } from "./three-col-cards"
import { whyEasnerHeadline, whyEasnerPillars } from "@/lib/marketing/content/home"

export function WhyEasner() {
  return (
    <ThreeColCards
      headline={whyEasnerHeadline}
      items={whyEasnerPillars}
      columns={4}
      showIcons
    />
  )
}
