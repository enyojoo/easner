/**
 * Screens for the "Pay contractors in [country]" pages: the payout form for that country, and the add-recipient
 * form with the exact details Easner asks for there. They show no rate and no amount, because those change.
 * Recipients are made up. Fields come from lib/marketing/corridor-guides.ts.
 */
import { DetailRows, FieldLabel, PButton, PCard, PField, RateChip, BalanceChip, surface } from "../web-parts"
import { RecipientAvatar } from "../app-parts"
import { panel, type Canvas } from "../canvas"
import { corridorGuides, type CorridorGuide } from "@/lib/marketing/corridor-guides"
import { payoutCountry } from "@/lib/marketing/corridors"

function PayoutCard({ guide }: { guide: CorridorGuide }) {
  const currency = payoutCountry(guide.country)?.currency ?? ""
  return (
    <PCard className="h-full">
      <div className="mb-4 text-xl font-semibold">Pay a contractor</div>
      <PField select className="min-h-16 border-input/80">
        <span className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">To:</span>
          <RecipientAvatar country={guide.code} size={36} />
          <span>
            <span className="block text-[15px] font-semibold leading-5">{guide.demo.name}</span>
            <span className="block text-xs text-muted-foreground">{guide.demo.detail}</span>
          </span>
        </span>
      </PField>
      <div className="mt-4">
        <FieldLabel aside={<RateChip>Rate and fees shown before you confirm</RateChip>}>They receive</FieldLabel>
        <PField className="min-h-[72px] border-input/80 text-[40px] font-bold tracking-[-0.02em]">{currency}</PField>
      </div>
      <DetailRows
        className="mt-4"
        rows={[
          ["Delivery", guide.deliveryLabel],
          ["Arrives", "Typically minutes to hours"],
        ]}
      />
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
        <BalanceChip />
        <PButton size="lg">Continue</PButton>
      </div>
    </PCard>
  )
}

function RecipientCard({ guide }: { guide: CorridorGuide }) {
  const currency = payoutCountry(guide.country)?.currency ?? ""
  return (
    <PCard className="h-full">
      <div className="mb-4 flex items-center gap-3">
        <RecipientAvatar country={guide.code} size={36} />
        <div>
          <div className="text-xl font-semibold leading-6">Add recipient</div>
          <div className="text-xs text-muted-foreground">
            {guide.label ?? guide.country} • {currency}
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {guide.demo.fields.map((field) => (
          <div key={field.label}>
            <FieldLabel>{field.label}</FieldLabel>
            <PField className="min-h-12 border-input/80">{field.value}</PField>
          </div>
        ))}
      </div>
      <PButton size="lg" className="mt-4 w-full justify-center">
        Save recipient
      </PButton>
    </PCard>
  )
}

const payoutSlot = (guide: CorridorGuide): Canvas => panel(600, 420, surface(<PayoutCard guide={guide} />))
const recipientSlot = (guide: CorridorGuide): Canvas =>
  panel(600, 200 + guide.demo.fields.length * 78, surface(<RecipientCard guide={guide} />))

export const CORRIDOR_SLOTS: Record<string, Canvas> = Object.fromEntries(
  corridorGuides.flatMap((guide) => {
    const slot = `mkt-corridor-${guide.code.toLowerCase()}`
    return [
      [slot, payoutSlot(guide)],
      [`${slot}-recipient`, recipientSlot(guide)],
    ]
  }),
)
