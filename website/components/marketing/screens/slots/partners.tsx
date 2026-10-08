/**
 * Easner for Partners page (design system: WebPartnerShowcase). Website illustrations of the Agency Model:
 * the Easner app under a fictional partner's brand, and what Easner runs underneath. No partner console is implied.
 */
import { Headphones, Landmark, ShieldCheck, Smartphone, Users, Wallet } from "lucide-react"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { StatusBadge, type StatusKey } from "@/components/ds/status-badge"
import { DEMO_FAITH_PARTNER, DEMO_PARTNER } from "@/lib/marketing/demo-data"
import { formatMoney } from "@/lib/marketing/format-money"
import { AppHomeScreen } from "../app-screens"
import type { AppBrand } from "../app-parts"
import { at, panel, phoneCard, type Canvas } from "../canvas"
import { PHONE_CANVAS, PhoneFrame } from "../frames"
import { PartnerBrandPanel, PartnerPhone } from "../partner-showcase"
import { Avatar, PCard, surface, TableHead, TableRow } from "../web-parts"

const FAITH_BRAND: AppBrand = {
  name: DEMO_FAITH_PARTNER.name,
  initial: DEMO_FAITH_PARTNER.initial,
  color: DEMO_FAITH_PARTNER.color,
  colorEnd: DEMO_FAITH_PARTNER.colorEnd,
  tint: DEMO_FAITH_PARTNER.tint,
  tintSubtle: DEMO_FAITH_PARTNER.tintSubtle,
}

function VerificationQueue() {
  const template = "1.5fr 1fr 1fr 0.9fr"
  const rows: [string, string, string, StatusKey, string][] = [
    ["AO", "Ama Owusu", "Individual", "verified", "Clear"],
    ["CO", "Chidi Okeke", "Individual", "in_review", "Clear"],
    ["KT", "Kente Traders", "Business", "action_required", "Review"],
    ["SB", "Sade Bakers", "Business", "verified", "Clear"],
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Customers</span>
        <span className="text-sm text-muted-foreground">KYC, KYB and screening</span>
      </div>
      <TableHead columns={["Customer", "Type", "Verification", "Screening"]} template={template} />
      {rows.map(([initials, name, type, status, screening], index) => (
        <TableRow
          key={name}
          divider={index > 0}
          template={template}
          cells={[
            <span key="n" className="flex items-center gap-2.5">
              <Avatar initials={initials} className="size-8 text-xs" />
              <span className="font-medium">{name}</span>
            </span>,
            <span key="t" className="text-muted-foreground">
              {type}
            </span>,
            <StatusBadge key="s" status={status} />,
            <span key="c" className={screening === "Clear" ? "text-success-text" : "text-warning-text"}>
              {screening}
            </span>,
          ]}
        />
      ))}
    </PCard>
  )
}

function CorridorPayouts() {
  const rows = [
    { code: "GH", corridor: "US → Ghana", methods: "Bank · Mobile money", count: 412, volume: 61840 },
    { code: "NG", corridor: "US → Nigeria", methods: "Bank", count: 298, volume: 44720 },
    { code: "KE", corridor: "US → Kenya", methods: "M-Pesa · Bank", count: 176, volume: 21120 },
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Payouts by corridor</span>
        <span className="text-sm text-muted-foreground">This week</span>
      </div>
      {rows.map((row) => (
        <div key={row.code} className="flex h-16 items-center gap-3 border-t border-border/60 px-5 text-sm">
          <CurrencyFlag code={row.code} size={32} />
          <span className="flex-1">
            <span className="block font-medium">{row.corridor}</span>
            <span className="block text-xs text-muted-foreground">{row.methods}</span>
          </span>
          <span className="w-24 text-right text-muted-foreground">{row.count} payouts</span>
          <span className="w-28 text-right font-semibold">{formatMoney(row.volume, "USD")}</span>
        </div>
      ))}
    </PCard>
  )
}

function ProgramOverview() {
  return (
    <PCard className="h-full">
      <div className="text-base font-semibold">Harbor Remit · programme</div>
      <div className="text-[13px] text-muted-foreground">Run with your Easner partner team</div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Customers", "12,480"],
          ["Payouts this month", "8,912"],
          ["In review", "6"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[16px] bg-muted/60 px-3.5 py-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-border/70 px-4 py-3">
        <span className="grid size-10 place-items-center rounded-full bg-surface-tint text-primary">
          <Headphones className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="flex-1 text-sm">
          <span className="block font-medium">Your Easner partner team</span>
          <span className="block text-muted-foreground">Corridor changes, reviews and escalations</span>
        </span>
        <span className="rounded-full border border-input/60 px-3 py-1.5 text-sm font-medium">Message</span>
      </div>
    </PCard>
  )
}

/** Agency Model, layered: the partner's branded app on top of what Easner runs. */
function AgencyStack() {
  const layers = [
    { Icon: Users, label: "Customer accounts" },
    { Icon: Wallet, label: "Pay-in and payouts" },
    { Icon: ShieldCheck, label: "Verification and screening" },
    { Icon: Landmark, label: "Licensed partners and rails" },
  ]
  return (
    <div className="grid h-full gap-3">
      <div
        className="flex items-center gap-3 rounded-[20px] p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${DEMO_PARTNER.color}, ${DEMO_PARTNER.colorEnd})` }}
      >
        <Smartphone className="size-6" strokeWidth={1.75} aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-base font-semibold">Harbor Remit app</span>
          <span className="block text-sm text-white/80">Your brand, your customers</span>
        </span>
      </div>
      <PCard className="grid gap-3 p-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Run by Easner</div>
        <div className="grid grid-cols-2 gap-2.5">
          {layers.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-[14px] bg-muted/60 px-3.5 py-3 text-sm font-medium">
              <Icon className="size-[18px] text-primary" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </PCard>
    </div>
  )
}

export const PARTNERS_SLOTS: Record<string, Canvas> = {
  "mkt-hero-partners-01": {
    width: 800,
    height: 640,
    render: () => (
      <>
        {at(10, 10, <PartnerPhone />, 1)}
        {at(400, 90, <PartnerBrandPanel className="w-[370px]" />, 2)}
      </>
    ),
    mobile: { width: PHONE_CANVAS.width, height: 520, render: () => at(0, 10, <PartnerPhone />) },
  },
  "mkt-ui-partners-branded": {
    width: 780,
    height: 520,
    render: () => (
      <>
        {at(
          0,
          10,
          <PhoneFrame>
            <AppHomeScreen />
          </PhoneFrame>,
        )}
        {at(380, 10, <PartnerPhone />)}
      </>
    ),
    mobile: { width: PHONE_CANVAS.width, height: 520, render: () => at(0, 10, <PartnerPhone />) },
  },
  "mkt-ui-partners-compliance": panel(600, 330, surface(<VerificationQueue />)),
  "mkt-ui-partners-rails": panel(600, 260, surface(<CorridorPayouts />)),
  "mkt-ui-partners-operations": panel(580, 300, surface(<ProgramOverview />)),
  "mkt-ui-partners-agency": panel(560, 300, surface(<AgencyStack />)),
  "mkt-ui-partners-faith": phoneCard(
    <AppHomeScreen
      brand={FAITH_BRAND}
      balance={DEMO_FAITH_PARTNER.balance}
      transactions={DEMO_FAITH_PARTNER.transactions}
      footnote="Powered by Easner"
    />,
    560,
  ),
}
