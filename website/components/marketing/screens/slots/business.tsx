/** Business Banking page screens (design system: BizHome, BizAccounts, BizAddMoneyLocal, BizSend, BizSettings Team). */
import { Plus, Send, UserPlus } from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { DEMO_BUSINESS, DEMO_SEND } from "@/lib/marketing/demo-data"
import { formatMoney, formatRate } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { at, panel, type Canvas } from "../canvas"
import { RecipientAvatar } from "../app-parts"
import {
  Avatar,
  BalanceChip,
  CopyValue,
  FieldLabel,
  MoneyRow,
  PButton,
  PCard,
  PField,
  ProductSurface,
  RateChip,
  surface,
} from "../web-parts"

/** Total balance with the two main actions, for compact compositions. */
export function CompactBalance() {
  return (
    <PCard>
      <div className="text-sm text-muted-foreground">Total balance</div>
      <div className="mt-1 text-[52px] font-bold leading-none tracking-[-0.025em]">
        <Amount value={DEMO_BUSINESS.totalBalance} cents="always" minor="display" />
      </div>
      <div className="mt-5 flex gap-2">
        <PButton icon={Send} className="rounded-full">
          Send
        </PButton>
        <PButton variant="outline" icon={Plus}>
          Add money
        </PButton>
      </div>
    </PCard>
  )
}

export function RecentActivity({ rows = 4, title = "Recent activity" }: { rows?: number; title?: string }) {
  return (
    <PCard padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">{title}</span>
        <span className="text-sm font-medium">View all</span>
      </div>
      {DEMO_BUSINESS.activity.slice(0, rows).map((row) => (
        <MoneyRow key={row.name} name={row.name} detail={row.detail} status={row.status} amount={row.amount} />
      ))}
    </PCard>
  )
}

export function AccountDetailsCard() {
  return (
    <PCard className="h-full">
      <div className="flex items-center gap-3">
        <CurrencyFlag code="USD" size={36} />
        <div className="flex-1">
          <div className="text-base font-semibold">USD account details</div>
          <div className="text-[13px] text-muted-foreground">For ACH and wire payments in the US</div>
        </div>
        <span className="flex gap-1.5">
          {["USD", "EUR", "GBP"].map((code) => (
            <span
              key={code}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                code === "USD" ? "bg-surface-tint text-primary-text" : "bg-muted text-muted-foreground",
              )}
            >
              {code}
            </span>
          ))}
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        <CopyValue label="Account name" value={DEMO_BUSINESS.name} />
        <div className="grid grid-cols-2 gap-3">
          <CopyValue label="Account number" value="•••• 9012" mono />
          <CopyValue label="Routing number" value="•••• 0021" mono />
        </div>
      </div>
    </PCard>
  )
}

export function SendMoneyCard() {
  const { recipient } = DEMO_SEND
  return (
    <PCard className="h-full">
      <div className="mb-4 text-xl font-semibold">Send money</div>
      <PField select className="min-h-16 border-input/80">
        <span className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">To:</span>
          <RecipientAvatar country={recipient.country} size={36} />
          <span>
            <span className="block text-[15px] font-semibold leading-5">{recipient.name}</span>
            <span className="block text-xs text-muted-foreground">{recipient.detail}</span>
          </span>
        </span>
      </PField>
      <div className="mt-4">
        <FieldLabel
          aside={
            <RateChip>
              Sending: {formatMoney(DEMO_SEND.sendAmount, "USD")} • Rate:{" "}
              {formatRate("USD", DEMO_SEND.receiveCurrency, DEMO_SEND.rate)}
            </RateChip>
          }
        >
          Amount
        </FieldLabel>
        <PField className="min-h-[72px] border-input/80 text-[40px] font-bold tracking-[-0.02em]">
          {formatMoney(DEMO_SEND.receiveAmount, DEMO_SEND.receiveCurrency)}
        </PField>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
        <BalanceChip />
        <PButton size="lg">Continue</PButton>
      </div>
    </PCard>
  )
}

export function MoneyInCard() {
  const rows = [
    { name: "Acme Logistics", detail: "Invoice INV-0142", amount: 12480, status: "paid" as const },
    { name: "Brightpath Studio", detail: "Payment link • Pro plan", amount: 500, status: "completed" as const },
    { name: "Lumen Coffee Co.", detail: "Checkout • Online store", amount: 115.07, status: "completed" as const },
    { name: "Lagos store", detail: "Terminal • QR Pay", amount: 84, status: "completed" as const },
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Money in</span>
        <span className="text-sm text-muted-foreground">Last 7 days</span>
      </div>
      {rows.map((row) => (
        <MoneyRow key={row.name} {...row} />
      ))}
    </PCard>
  )
}

export function TeamCard() {
  const members = [
    { initials: "AO", name: "Ada Obi", you: true, email: "ada@northwind.co", role: "Owner" },
    { initials: "KM", name: "Kofi Mensah", email: "kofi@northwind.co", role: "Admin" },
    { initials: "TL", name: "Tolu Lawal", email: "tolu@northwind.co", role: "Member", invited: true },
  ]
  return (
    <PCard className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold">Team members</div>
          <div className="text-sm text-muted-foreground">Invite teammates and manage access.</div>
        </div>
        <PButton icon={UserPlus}>Invite</PButton>
      </div>
      <div className="mt-4 grid gap-2.5">
        {members.map((member) => (
          <div key={member.name} className="flex items-center gap-3 rounded-[16px] border border-border/70 px-4 py-3">
            <Avatar initials={member.initials} />
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-medium">
                {member.name} {member.you && <span className="font-normal text-muted-foreground">(you)</span>}
              </div>
              <div className="text-muted-foreground">{member.email}</div>
            </div>
            {member.invited && (
              <span className="rounded-full bg-warning-surface px-2.5 py-1 text-xs font-medium text-warning-text">Invited</span>
            )}
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{member.role}</span>
          </div>
        ))}
      </div>
    </PCard>
  )
}

export const BUSINESS_SLOTS: Record<string, Canvas> = {
  "mkt-hero-business-01": {
    width: 760,
    height: 560,
    render: () => (
      <ProductSurface className="h-full bg-transparent">
        {at(
          30,
          30,
          <div className="w-[560px]">
            <CompactBalance />
          </div>,
          1,
        )}
        {at(
          170,
          250,
          <div className="w-[560px]">
            <RecentActivity />
          </div>,
          2,
        )}
      </ProductSurface>
    ),
  },
  "mkt-ui-business-accounts": panel(600, 330, surface(<AccountDetailsCard />)),
  "mkt-ui-business-send": panel(600, 380, surface(<SendMoneyCard />)),
  "mkt-ui-business-collections": panel(600, 340, surface(<MoneyInCard />)),
  "mkt-ui-business-team": panel(600, 340, surface(<TeamCard />)),
}
