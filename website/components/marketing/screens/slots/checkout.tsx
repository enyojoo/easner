/** Checkout page screens (design system: CheckoutHosted, CheckoutPay, BizCheckout). Lumen Coffee Co. is fictional. */
import { Tag } from "lucide-react"
import { StatusBadge, type StatusKey } from "@/components/ds/status-badge"
import { DEMO_MERCHANTS } from "@/lib/marketing/demo-data"
import { formatMoney } from "@/lib/marketing/format-money"
import { at, panel, type Canvas } from "../canvas"
import { BrowserFrame } from "../frames"
import { MerchantHeader, OrderSummary, PayPanel } from "../pay-parts"
import { Avatar, PCard, ProductSurface, surface, TableHead, TableRow } from "../web-parts"

const lumen = DEMO_MERCHANTS.lumen
const brightpath = DEMO_MERCHANTS.brightpath
const money = (value: number) => formatMoney(value, "USD", { cents: "always" })

export function LumenOrder() {
  return (
    <OrderSummary
      merchant={lumen}
      amount={115.07}
      lines={[
        { name: "House blend, whole bean", detail: "1 kg bag · $24.00 each", amount: 48, qty: 2 },
        { name: "Pour-over kettle", detail: "Matte black", amount: 65, qty: 1 },
      ]}
      totals={[
        ["Subtotal", money(113)],
        [
          "Discount",
          <span key="d" className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-xs">
              <Tag className="size-3" strokeWidth={2} aria-hidden="true" />
              WELCOME10
            </span>
            {formatMoney(-11.3, "USD", { cents: "always" })}
          </span>,
        ],
        ["Shipping", money(6)],
        ["Sales tax 7.25%", money(7.37)],
        ["Total due today", money(115.07)],
      ]}
    />
  )
}

export function HostedCheckout() {
  return (
    <div className="h-[760px] w-[920px] rounded-[20px] shadow-showcase">
      <BrowserFrame url="checkout.easner.com/cs_8Kq2…">
        <ProductSurface className="grid h-full grid-cols-2">
          <div className="px-10 py-10">
            <MerchantHeader merchant={lumen} />
            <div className="mt-6">
              <PayPanel merchant={lumen} amount={115.07} email="ada@acme.com" />
            </div>
          </div>
          <LumenOrder />
        </ProductSurface>
      </BrowserFrame>
    </div>
  )
}

function SubscriptionSummary() {
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <OrderSummary
        merchant={brightpath}
        title="Try Pro plan"
        headline="14 days free"
        amount={0}
        subtitle="Then $49 every month, starting Oct 22, 2026. Cancel any time."
        lines={[{ name: "Pro plan", detail: "Monthly · up to 10 seats", amount: 49 }]}
        totals={[
          ["Trial", "14 days"],
          ["Due today", money(0)],
        ]}
      />
    </PCard>
  )
}

function MethodsCard() {
  return (
    <PCard className="h-full">
      <MerchantHeader merchant={brightpath} />
      <div className="mt-4">
        <PayPanel merchant={brightpath} amount={49} email={null} compact payLabel="Start subscription" />
      </div>
    </PCard>
  )
}

function CheckoutPaymentsCard() {
  const template = "1.3fr 1.5fr 1fr 0.8fr"
  const rows: [string, string, string, string, StatusKey, number][] = [
    ["AM", "Ada Mensah", "lumencoffee.com", "Visa •••• 4242", "paid", 115.07],
    ["KB", "Kofi Boateng", "Link · Beans every 2 weeks", "Mastercard •••• 5100", "paid", 36],
    ["EO", "Esi Owusu", "lumencoffee.com", "US bank •••• 6789", "processing", 64.5],
    ["YA", "Yaw Asante", "lumencoffee.com", "USDC on Solana", "paid", 50],
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Recent payments</span>
        <span className="text-sm font-medium text-primary-text">All payments</span>
      </div>
      <TableHead columns={["Customer", "From", "Status", "Amount"]} template={template} />
      {rows.map(([initials, name, from, method, status, amount], index) => (
        <TableRow
          key={name}
          divider={index > 0}
          template={template}
          cells={[
            <span key="c" className="flex items-center gap-2.5">
              <Avatar initials={initials} className="size-8 text-xs" />
              <span className="font-medium">{name}</span>
            </span>,
            <span key="f">
              <span className="block truncate leading-5">{from}</span>
              <span className="block text-xs text-muted-foreground">{method}</span>
            </span>,
            <StatusBadge key="s" status={status} />,
            <span key="a" className="font-semibold">
              {money(amount)}
            </span>,
          ]}
        />
      ))}
    </PCard>
  )
}

export const CHECKOUT_SLOTS: Record<string, Canvas> = {
  "mkt-hero-checkout-01": {
    width: 980,
    height: 820,
    render: () => at(30, 30, <HostedCheckout />),
    mobile: panel(
      440,
      640,
      surface(
        <PCard>
          <MerchantHeader merchant={lumen} />
          <div className="mt-5">
            <PayPanel merchant={lumen} amount={115.07} email={null} />
          </div>
        </PCard>,
      ),
    ),
  },
  "mkt-ui-checkout-onetime": panel(
    520,
    540,
    surface(
      <PCard padded={false} className="h-full overflow-hidden">
        <LumenOrder />
      </PCard>,
    ),
  ),
  "mkt-ui-checkout-subscription": panel(520, 420, surface(<SubscriptionSummary />)),
  "mkt-ui-checkout-methods": panel(480, 420, surface(<MethodsCard />)),
  "mkt-ui-checkout-ledger": panel(640, 340, surface(<CheckoutPaymentsCard />)),
}
