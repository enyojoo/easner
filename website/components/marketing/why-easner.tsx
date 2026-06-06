import { ThreeColCards } from "./three-col-cards"
import { whyEasnerPillars } from "@/lib/marketing/content/home"

export function WhyEasner() {
  return (
    <ThreeColCards
      headline="Why global businesses choose Easner"
      items={whyEasnerPillars}
      columns={4}
      showIcons
    />
  )
}
