/** Developers page screens (design system: BizConsoleDeveloper, BizConsoleCustomers). Fictional test-mode data. */
import type { ReactNode } from "react"
import { Copy, Search } from "lucide-react"
import { StatusBadge } from "@/components/ds/status-badge"
import { formatMoney, formatRate } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { panel, type Canvas } from "../canvas"
import { CopyValue, DetailRows, PButton, PCard, PField, RateChip, surface, TableHead, TableRow } from "../web-parts"

function ModeSwitch() {
  return (
    <span className="inline-flex rounded-full bg-muted p-1 text-sm font-medium">
      <span className="rounded-full bg-card px-3 py-1 shadow-soft">Test</span>
      <span className="px-3 py-1 text-muted-foreground">Live</span>
    </span>
  )
}

function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-hidden whitespace-pre rounded-[16px] bg-muted/70 p-4 font-mono text-[13px] leading-[21px]",
        className,
      )}
    >
      {children}
    </pre>
  )
}

const k = (text: string) => <span className="text-primary-text">{text}</span>

export function WorkbenchCard() {
  return (
    <PCard className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Workbench</div>
        <ModeSwitch />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <PField select>
          <span className="font-mono text-[13px]">easner_sk_test_51Hx…Qp</span>
        </PField>
        <PField select>
          <span className="text-sm">
            <span className="font-semibold">POST</span> /v1/payouts
          </span>
        </PField>
      </div>
      <div className="mt-4 text-sm font-medium">Request</div>
      <Code className="mt-2">
        {`{
  "customer": "cus_8f2a41c7",
  "amount": 45000,
  "currency": "usd",
  "destination": "dst_gh_0123456789"
}`}
      </Code>
      <div className="mt-4 flex items-center gap-2 text-sm font-medium">
        Response
        <span className="rounded-full bg-success-surface px-2 py-0.5 text-xs font-medium text-success-text">200 OK</span>
      </div>
      <Code className="mt-2">
        <>
          {"{\n  "}
          {k('"id"')}: &quot;po_3kL9x2&quot;,{"\n  "}
          {k('"status"')}: &quot;processing&quot;,{"\n  "}
          {k('"rate"')}: &quot;12.25&quot;,{"\n  "}
          {k('"recipient_amount"')}: &quot;5512.40 GHS&quot;{"\n}"}
        </>
      </Code>
    </PCard>
  )
}

export function CustomersCard() {
  const template = "1.5fr 1.1fr 1fr"
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Customers</span>
        <span className="flex h-9 w-56 items-center gap-2 rounded-[16px] border border-input px-3 text-[13px] text-muted-foreground">
          <Search className="size-4" strokeWidth={2} aria-hidden="true" />
          Search name, email, cus_…
        </span>
      </div>
      <TableHead columns={["Name", "ID", "Verification"]} template={template} />
      {[
        ["Acme Logistics", "Business", "cus_8f2a41c7", "verified"],
        ["Kwame Mensah", "Individual", "cus_41c79d03", "pending"],
        ["Sade Bakers", "Business", "cus_c61e90aa", "unverified"],
        ["Amara Okafor", "Individual", "cus_77d1b2e0", "verified"],
      ].map(([name, type, id, status], index) => (
        <TableRow
          key={id}
          divider={index > 0}
          template={template}
          cells={[
            <span key="n">
              <span className="block font-medium leading-5">{name}</span>
              <span className="block text-xs text-muted-foreground">{type}</span>
            </span>,
            <span key="i" className="font-mono text-[13px]">
              {id}
            </span>,
            <StatusBadge key="s" status={status as "verified"} />,
          ]}
        />
      ))}
    </PCard>
  )
}

export function ReceiveRailsCard() {
  return (
    <PCard className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">Acme Logistics</div>
          <div className="text-[13px] text-muted-foreground">Receive rails</div>
        </div>
        <StatusBadge status="verified" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <CopyValue label="Account number" value="•••• 5531" mono />
        <CopyValue label="Routing number" value="•••• 0021" mono />
      </div>
      <div className="mt-3">
        <CopyValue label="USDC deposit address (Solana)" value="7xKX…9fQm" mono />
      </div>
      <div className="mt-3 flex gap-2 text-xs">
        {["acct_21b7c0d4 · USD", "acct_90e5a3f1 · USDC"].map((chip) => (
          <span key={chip} className="rounded-full bg-muted px-2.5 py-1 font-mono">
            {chip}
          </span>
        ))}
      </div>
    </PCard>
  )
}

export function PayoutQuoteCard() {
  return (
    <PCard className="h-full">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Payout quote</div>
        <RateChip>Rate: {formatRate("USD", "GHS", 12.25)}</RateChip>
      </div>
      <DetailRows
        className="mt-3"
        rows={[
          ["Customer", "Kwame Mensah"],
          ["You send", formatMoney(450, "USD", { cents: "always" })],
          ["Fee", formatMoney(2.5, "USD", { cents: "always" })],
          [
            "Recipient gets",
            <span key="r" className="font-semibold">
              {formatMoney(5512.4, "GHS", { cents: "always" })}
            </span>,
          ],
          ["Destination", "GCB • 0123 4567 89"],
          ["Status", <StatusBadge key="s" status="processing" />],
        ]}
      />
    </PCard>
  )
}

export function WebhooksCard() {
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="px-5 pb-3 pt-4">
        <div className="text-base font-semibold">Test endpoints</div>
        <div className="mt-3 rounded-[16px] border border-border/70 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[13px]">https://api.yourapp.com/easner/webhooks</span>
            <span className="rounded-full bg-success-surface px-2.5 py-1 text-xs font-medium text-success-text">Test</span>
          </div>
          <div className="mt-2 flex gap-1.5 text-xs">
            {["payout.completed", "deposit.received", "customer.verified"].map((event) => (
              <span key={event} className="rounded-full bg-muted px-2 py-0.5 font-mono">
                {event}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 pb-2 text-sm font-medium">Recent deliveries</div>
      {[
        ["payout.completed", "2:14 PM"],
        ["deposit.received", "2:09 PM"],
        ["customer.verified", "1:52 PM"],
      ].map(([event, time]) => (
        <div key={event} className="flex h-11 items-center gap-3 border-t border-border/60 px-5 text-sm">
          <span className="rounded-full bg-success-surface px-2 py-0.5 text-xs font-medium text-success-text">200</span>
          <span className="flex-1 font-mono text-[13px]">{event}</span>
          <span className="text-muted-foreground">{time}</span>
        </div>
      ))}
    </PCard>
  )
}

export function ApiKeysCard() {
  return (
    <PCard className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold">Test keys</div>
          <div className="text-[13px] text-muted-foreground">Create as many as you need for this mode.</div>
        </div>
        <PButton className="rounded-full">Create test key</PButton>
      </div>
      <div className="mt-4 rounded-[16px] border border-border/70 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Backend production</div>
            <div className="text-[13px] text-muted-foreground">Secret key</div>
          </div>
          <span className="flex gap-2 text-sm">
            <span className="rounded-full border border-input/60 px-3 py-1">Roll key</span>
            <span className="px-2 py-1 text-destructive-text">Revoke</span>
          </span>
        </div>
        <span className="mt-3 inline-flex items-center gap-2 rounded-[14px] bg-muted/70 px-3 py-2 font-mono text-[13px]">
          easner_sk_test_8dK2…f1
          <Copy className="size-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="mt-3 flex gap-1.5 text-xs">
          {["Accounts (write)", "Transfers", "Customers", "Webhooks"].map((scope) => (
            <span key={scope} className="rounded-full bg-muted px-2.5 py-1">
              {scope}
            </span>
          ))}
        </div>
      </div>
      <Code className="mt-4 text-[12.5px]">{`curl https://api.easner.com/v1/customers \\
  -H "Authorization: Bearer easner_sk_test_..."`}</Code>
    </PCard>
  )
}

export const DEVELOPERS_SLOTS: Record<string, Canvas> = {
  "mkt-hero-apis-01": panel(640, 560, surface(<WorkbenchCard />)),
  "mkt-hero-developers-01": panel(640, 560, surface(<WorkbenchCard />)),
  "mkt-ui-api-identity": panel(600, 330, surface(<CustomersCard />)),
  "mkt-ui-api-payin": panel(600, 330, surface(<ReceiveRailsCard />)),
  "mkt-ui-api-payouts": panel(600, 380, surface(<PayoutQuoteCard />)),
  "mkt-ui-api-webhooks": panel(600, 340, surface(<WebhooksCard />)),
  "mkt-ui-api-dev-panel": panel(640, 420, surface(<ApiKeysCard />)),
}
