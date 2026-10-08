/** Payment Links page screens (design system: BizLinks, BizPayPublic). Merchants are fictional. */
import { Copy, Link2, Mail, MessageCircle, Plus, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { StatusBadge, type StatusKey } from "@/components/ds/status-badge"
import { DEMO_MERCHANTS } from "@/lib/marketing/demo-data"
import { formatMoney } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { at, panel, type Canvas } from "../canvas"
import { BrowserFrame } from "../frames"
import { MerchantHeader, OrderSummary, PayPanel, Segmented } from "../pay-parts"
import { MoneyRow, PButton, PCard, ProductSurface, surface, TableHead, TableRow } from "../web-parts"
import { Amount } from "@/components/ds/amount"

const northwind = DEMO_MERCHANTS.northwind
const lumen = DEMO_MERCHANTS.lumen
const money = (value: number) => formatMoney(value, "USD", { cents: "always" })

function HostedLink() {
  return (
    <div className="h-[700px] w-[920px] rounded-[20px] shadow-showcase">
      <BrowserFrame url="pay.easner.com/northwind/consulting">
        <ProductSurface className="grid h-full grid-cols-2">
          <div className="px-10 py-10">
            <MerchantHeader merchant={northwind} />
            <div className="mt-6">
              <PayPanel merchant={northwind} amount={450} />
            </div>
          </div>
          <OrderSummary
            merchant={northwind}
            amount={450}
            subtitle="Consulting session · 90 minutes"
            lines={[{ name: "Consulting session", detail: "90 minutes, video call", amount: 450 }]}
            totals={[["Total due today", money(450)]]}
          />
        </ProductSurface>
      </BrowserFrame>
    </div>
  )
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span className={cn("relative h-6 w-10 shrink-0 rounded-full", on ? "bg-primary" : "bg-input")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow", on ? "left-[18px]" : "left-0.5")} />
    </span>
  )
}

function CreateLinkCard() {
  return (
    <PCard className="h-full">
      <div className="mb-4 text-base font-semibold">What are you selling?</div>
      <Segmented
        active={0}
        options={[
          { label: "One-time", Icon: Link2 },
          { label: "Subscription", Icon: Link2 },
          { label: "Customer chooses", Icon: Link2 },
        ]}
      />
      <div className="mt-4 flex items-center gap-3">
        <span
          className="grid size-11 place-items-center rounded-[12px] text-base font-semibold text-white"
          style={{ background: lumen.color }}
        >
          B
        </span>
        <span className="flex-1 text-sm">
          <span className="block font-medium">Brewing class, Nov 14</span>
          <span className="block text-muted-foreground">90 minutes, all equipment included</span>
        </span>
        <span className="flex h-11 w-32 items-center justify-end rounded-[16px] border border-input px-3 text-[15px]">
          $45.00
        </span>
      </div>
      <div className="mt-4 grid gap-1">
        {[
          ["Customers choose the quantity", "Between 1 and 4 per order.", true],
          ["Limit payments", "Close the link after 16 payments.", true],
        ].map(([title, sub, on]) => (
          <div key={title as string} className="flex items-center justify-between border-t border-border/60 py-3 text-sm">
            <span>
              <span className="block font-medium">{title}</span>
              <span className="block text-muted-foreground">{sub}</span>
            </span>
            <Toggle on={on as boolean} />
          </div>
        ))}
      </div>
      <PButton size="lg" className="mt-2 w-full">
        Create payment link
      </PButton>
    </PCard>
  )
}

function ShareCard() {
  const url = "pay.easner.com/lumen/class-nov"
  return (
    <PCard className="h-full">
      <div className="flex items-start gap-5">
        <span className="rounded-[16px] bg-white p-3 shadow-[inset_0_0_0_1px_var(--border)]">
          <QRCodeSVG value={`https://${url}`} size={128} level="M" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold">Brewing class, Nov 14</div>
          <div className="text-sm text-muted-foreground">One-time · $45 · 12 of 16 seats</div>
          <StatusBadge status="active" className="mt-2" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 rounded-[16px] bg-muted/70 px-3.5 py-3">
        <span className="truncate font-mono text-sm">{url}</span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Copy className="size-4" strokeWidth={2} aria-hidden="true" />
          Copy
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <PButton variant="outline" icon={MessageCircle} size="sm">
          WhatsApp
        </PButton>
        <PButton variant="outline" icon={Mail} size="sm">
          Email
        </PButton>
        <PButton variant="outline" icon={QrCode} size="sm">
          Print QR
        </PButton>
      </div>
    </PCard>
  )
}

function LinksTable() {
  const template = "1.55fr 1.9fr 0.75fr 0.95fr 0.85fr"
  const rows: [string, string, string, number, number, StatusKey][] = [
    ["Beans every 2 weeks", "lumen/beans", "Subscription · $36 every 2 weeks", 118, 3412, "active"],
    ["Gift card", "lumen/gift", "Customer chooses · from $10", 42, 2180, "active"],
    ["Brewing class, Nov 14", "lumen/class-nov", "One-time · $45", 12, 540, "active"],
    ["Summer sampler", "lumen/sampler", "One-time · $29", 64, 1856, "cancelled"],
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Payment links</span>
        <PButton icon={Plus} className="h-9 rounded-full px-4">
          Create link
        </PButton>
      </div>
      <TableHead columns={["Link", "Price", "Payments", "Collected", "Status"]} template={template} />
      {rows.map(([name, path, price, count, collected, status], index) => (
        <TableRow
          key={name}
          divider={index > 0}
          template={template}
          cells={[
            <span key="l">
              <span className="block truncate font-medium leading-5">{name}</span>
              <span className="block truncate font-mono text-xs text-muted-foreground">pay.easner.com/{path}</span>
            </span>,
            <span key="p" className="text-[13px]">
              {price}
            </span>,
            <span key="c">{count}</span>,
            <span key="m" className="font-semibold">
              {money(collected)}
            </span>,
            <span key="s" className="flex justify-end">
              {status === "cancelled" ? (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Closed</span>
              ) : (
                <StatusBadge status={status} />
              )}
            </span>,
          ]}
        />
      ))}
    </PCard>
  )
}

function ToBalanceCard() {
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <CurrencyFlag code="USD" size={32} />
        <span className="flex-1">
          <span className="block text-sm text-muted-foreground">USD Balance</span>
          <span className="block text-2xl font-semibold tracking-[-0.01em]">
            <Amount value={24190.32} cents="always" minor="display" />
          </span>
        </span>
        <span className="text-sm text-primary-text">
          <Amount value={1250} signed className="font-medium" /> today
        </span>
      </div>
      <MoneyRow name="Kofi Boateng" detail="Payment link · Beans every 2 weeks" amount={36} status="completed" />
      <MoneyRow name="Ama Owusu" detail="Payment link · Brewing class, Nov 14" amount={90} status="completed" />
      <MoneyRow name="Yaw Asante" detail="Payment link · Gift card" amount={50} status="processing" />
    </PCard>
  )
}

export const PAYMENT_LINKS_SLOTS: Record<string, Canvas> = {
  "mkt-hero-paylinks-01": {
    width: 980,
    height: 760,
    render: () => at(30, 30, <HostedLink />),
    mobile: panel(
      440,
      600,
      surface(
        <PCard>
          <MerchantHeader merchant={northwind} />
          <div className="mt-5">
            <PayPanel merchant={northwind} amount={450} email={null} compact />
          </div>
        </PCard>,
      ),
    ),
  },
  "mkt-ui-paylinks-create": panel(540, 440, surface(<CreateLinkCard />)),
  "mkt-ui-paylinks-share": panel(540, 360, surface(<ShareCard />)),
  "mkt-ui-paylinks-stats": panel(800, 340, surface(<LinksTable />)),
  "mkt-ui-paylinks-ledger": panel(600, 300, surface(<ToBalanceCard />)),
}
