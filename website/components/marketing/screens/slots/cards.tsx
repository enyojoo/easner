/**
 * Cards page screens (design system: CardFace, BizCards). Cards are not generally available, so every
 * visual carries the design system's "Coming soon" face or a "Preview" label (Voice and Guardrails: cards when available).
 */
import type { ReactNode } from "react"
import Image from "next/image"
import { Lock, Plus, Snowflake } from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { formatMoney } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { at, panel, type Canvas } from "../canvas"
import { Avatar, MoneyRow, PButton, PCard, PField, surface } from "../web-parts"

/** Mastercard's own mark colours (third-party brand art, not Easner tokens). */
// eslint-disable-next-line no-restricted-syntax
const MASTERCARD = { red: "#EB001B", yellow: "#F79E1B" } as const

/** Card faces are drawn at 380 wide and scaled, so logo, type and marks keep their proportions. */
const FACE_WIDTH = 380

/** The Easner card face: graphite, the white logo, a blue glow in one corner, and the network mark. */
export function CardFace({
  holder,
  company = "Northwind Trading Ltd",
  last4,
  label,
  badge = "Coming soon",
  width = 380,
}: {
  holder: string
  company?: string
  last4?: string
  label?: string
  badge?: string | null
  width?: number
}) {
  const scale = width / FACE_WIDTH
  return (
    <div style={{ width, height: width / 1.586 }}>
      <div
        className="relative flex origin-top-left flex-col justify-between overflow-hidden rounded-[18px] bg-[radial-gradient(120%_90%_at_100%_100%,rgba(0,122,204,0.45),transparent_45%),linear-gradient(135deg,var(--brand-graphite),var(--brand-ink))] p-6 text-white shadow-[var(--app-shadow-card-face)]"
        style={{ width: FACE_WIDTH, height: FACE_WIDTH / 1.586, transform: scale === 1 ? undefined : `scale(${scale})` }}
      >
        <div className="flex items-start justify-between">
          <Image src="/easner-logo-white.svg" alt="" width={119} height={26} />
          {badge ? (
            <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-medium">{badge}</span>
          ) : (
            label && <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/70">{label}</span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-base font-medium">{holder}</div>
            <div className="text-xs text-white/60">{company}</div>
          </div>
          <div className="grid justify-items-end gap-2">
            {last4 && <span className="font-mono text-sm tracking-[0.12em]">•• {last4}</span>}
            <span className="flex" aria-hidden="true">
              <span className="size-7 rounded-full" style={{ background: MASTERCARD.red }} />
              <span className="-ml-3 size-7 rounded-full mix-blend-screen" style={{ background: MASTERCARD.yellow }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Preview({ children }: { children?: ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{children ?? "Preview"}</span>
  )
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span className={cn("relative h-6 w-10 shrink-0 rounded-full", on ? "bg-primary" : "bg-input")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow", on ? "left-[18px]" : "left-0.5")} />
    </span>
  )
}

function IssueCard() {
  return (
    <PCard className="h-full">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold">New card</span>
        <Preview />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_200px] gap-5">
        <div className="grid gap-3">
          <PField select>Olivia Mensah</PField>
          <div className="grid grid-cols-2 rounded-[16px] bg-muted p-1 text-sm font-medium">
            <span className="rounded-[12px] bg-card py-2 text-center shadow-soft">Virtual</span>
            <span className="py-2 text-center text-muted-foreground">Physical</span>
          </div>
          <PField>Ads and software</PField>
          <PField>
            <span className="flex justify-between">
              <span className="text-muted-foreground">Monthly limit</span>
              <span className="font-medium">$2,000</span>
            </span>
          </PField>
        </div>
        <div className="pt-1">
          <CardFace holder="Ads and software" width={200} badge={null} label="Virtual" />
        </div>
      </div>
      <PButton size="lg" className="mt-4 w-full">
        Create card
      </PButton>
    </PCard>
  )
}

function ControlsCard() {
  return (
    <PCard className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">Ads and software</div>
          <div className="text-[13px] text-muted-foreground">Virtual •• 8817 · Olivia Mensah</div>
        </div>
        <Preview />
      </div>
      <div className="mt-4 rounded-[16px] bg-muted/60 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Spent this month</span>
          <span>
            <span className="font-semibold">{formatMoney(1240, "USD")}</span>
            <span className="text-muted-foreground"> of $2,000</span>
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-border">
          <div className="h-2 w-[62%] rounded-full bg-primary" />
        </div>
      </div>
      <div className="mt-2">
        {[
          ["Online payments", true],
          ["International payments", true],
          ["ATM withdrawals", false],
        ].map(([label, on]) => (
          <div
            key={label as string}
            className="flex h-12 items-center justify-between border-b border-border/60 text-sm last:border-0"
          >
            {label}
            <Toggle on={on as boolean} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <PButton variant="outline" icon={Snowflake}>
          Freeze card
        </PButton>
        <PButton variant="outline" icon={Lock}>
          Show details
        </PButton>
      </div>
    </PCard>
  )
}

function CardholdersCard() {
  const people = [
    ["OM", "Olivia Mensah", "Physical •• 4242 · Virtual •• 8817", "$5,000 a month"],
    ["KM", "Kofi Mensah", "Virtual •• 1033 · Travel", "$3,000 a month"],
    ["TL", "Tolu Lawal", "Virtual •• 7720 · Ads", "$1,000 a month"],
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Cardholders</span>
        <span className="flex items-center gap-2">
          <Preview />
          <PButton icon={Plus} className="h-9 rounded-full px-4">
            Add cardholder
          </PButton>
        </span>
      </div>
      {people.map(([initials, name, cards, limit]) => (
        <div key={name} className="flex h-16 items-center gap-3 border-t border-border/60 px-5 text-sm">
          <Avatar initials={initials} className="size-9 text-xs" />
          <span className="flex-1">
            <span className="block font-medium">{name}</span>
            <span className="block text-xs text-muted-foreground">{cards}</span>
          </span>
          <span className="text-muted-foreground">{limit}</span>
        </div>
      ))}
    </PCard>
  )
}

function ReportingCard() {
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span>
          <span className="block text-base font-semibold">Card spend</span>
          <span className="block text-[13px] text-muted-foreground">
            October · <Amount value={-4189} /> across 3 cards
          </span>
        </span>
        <Preview />
      </div>
      <MoneyRow name="Figma" detail="Ads and software •• 8817 · Oct 24" amount={-129} />
      <MoneyRow name="Delta Air Lines" detail="Travel •• 1033 · Oct 22" amount={-860} />
      <MoneyRow name="Google Ads" detail="Ads •• 7720 · Oct 21" amount={-3200} />
    </PCard>
  )
}

export const CARDS_SLOTS: Record<string, Canvas> = {
  "mkt-hero-cards-01": {
    width: 720,
    height: 560,
    render: () => (
      <>
        {at(40, 60, <CardFace holder="Olivia Mensah" last4="4242" />, 1)}
        {at(300, 250, <CardFace holder="Ads and software" last4="8817" />, 2)}
      </>
    ),
  },
  "mkt-ui-cards-issue": panel(600, 380, surface(<IssueCard />)),
  "mkt-ui-cards-controls": panel(560, 420, surface(<ControlsCard />)),
  "mkt-ui-cards-cardholders": panel(600, 290, surface(<CardholdersCard />)),
  "mkt-ui-cards-reporting": panel(600, 260, surface(<ReportingCard />)),
}
