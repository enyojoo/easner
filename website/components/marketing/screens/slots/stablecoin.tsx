/** Stablecoin page screens (design system: BizTerminal, BizPayCounter, BizAddMoney, BizSend). Networks shown where enabled. */
import { Coins, Copy, ExternalLink, Wallet } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { StatusBadge, type StatusKey } from "@/components/ds/status-badge"
import { formatMoney } from "@/lib/marketing/format-money"
import { panel, type Canvas } from "../canvas"
import { Segmented } from "../pay-parts"
import { DetailRows, FieldLabel, MoneyRow, PButton, PCard, PField, surface, TableHead, TableRow } from "../web-parts"

const ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"

function ReceiveCard() {
  return (
    <PCard className="h-full">
      <div className="text-xl font-semibold">Receive stablecoins</div>
      <div className="text-[13px] text-muted-foreground">Send only USDC on Solana to this address.</div>
      <div className="mt-4">
        <Segmented
          active={0}
          options={[
            { label: "USDC", Icon: Coins },
            { label: "EURC", Icon: Coins },
          ]}
        />
      </div>
      <div className="mt-3">
        <FieldLabel>Network</FieldLabel>
        <PField select>Solana</PField>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="rounded-[16px] bg-white p-3 shadow-[inset_0_0_0_1px_var(--border)]">
          <QRCodeSVG value={`solana:${ADDRESS}`} size={132} level="M" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 text-[13px] font-medium text-muted-foreground">Deposit address</div>
          <div className="flex items-start gap-3 rounded-[16px] bg-muted/70 px-3.5 py-3 font-mono text-[13px] leading-5">
            <span className="break-all">{ADDRESS}</span>
            <Copy className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
      </div>
    </PCard>
  )
}

function DepositsCard() {
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Stablecoin deposits</span>
        <span className="text-sm text-muted-foreground">This week</span>
      </div>
      <MoneyRow name="Acme Logistics" detail="USDC · Solana" amount={5000} status="completed" />
      <MoneyRow name="Hansa Freight GmbH" detail="EURC · Base" amount={2400} currency="EUR" status="completed" />
      <MoneyRow name="Northstar Studio" detail="USDC · Ethereum" amount={1250} status="processing" />
    </PCard>
  )
}

function TerminalCard() {
  const template = "64px 1.2fr 1fr 1.25fr 0.8fr"
  const rows: [string, string, string, string, StatusKey, number][] = [
    ["Sep 26", "USDC", "Solana", "48.20 USDC", "paid", 48.2],
    ["Sep 26", "USDT", "Tron", "120.05 USDT", "awaiting_deposit", 120],
    ["Sep 25", "USDC", "Base", "15.00 USDC", "payout_pending", 15],
    ["Sep 25", "USDC", "Solana", "–", "failed", 9.5],
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span>
          <span className="block text-base font-semibold">Terminal</span>
          <span className="block text-[13px] text-muted-foreground">Take in-person stablecoin payments at your counter.</span>
        </span>
        <PButton variant="outline" icon={ExternalLink} size="sm">
          Open counter
        </PButton>
      </div>
      <TableHead columns={["Created", "Asset", "Min. crypto", "Status", "Amount"]} template={template} />
      {rows.map(([date, asset, network, crypto, status, amount], index) => (
        <TableRow
          key={`${date}${crypto}${index}`}
          divider={index > 0}
          template={template}
          cells={[
            <span key="d" className="text-muted-foreground">
              {date}
            </span>,
            <span key="a">
              <span className="block font-medium leading-5">{asset}</span>
              <span className="block text-xs text-muted-foreground">{network}</span>
            </span>,
            <span key="c" className="font-mono text-[13px]">
              {crypto}
            </span>,
            <StatusBadge key="s" status={status} />,
            <span key="m" className="font-semibold">
              {formatMoney(amount, "USD", { cents: "always" })}
            </span>,
          ]}
        />
      ))}
    </PCard>
  )
}

function CounterCard() {
  return (
    <PCard className="h-full text-center">
      <div className="text-sm text-muted-foreground">Northwind Trading Ltd · Lagos store</div>
      <div className="mt-1 text-[40px] font-bold leading-[48px] tracking-[-0.02em]">
        {formatMoney(48.2, "USD", { cents: "always" })}
      </div>
      <div className="mx-auto mt-3 w-fit rounded-[20px] bg-white p-4 shadow-[inset_0_0_0_1px_var(--border)]">
        <QRCodeSVG value={`solana:${ADDRESS}?amount=48.2`} size={156} level="M" />
      </div>
      <div className="mt-3 text-[15px] font-semibold">Scan to pay 48.20 USDC</div>
      <div className="text-[13px] text-muted-foreground">On Solana · held for 09:41</div>
      <div className="mt-3 flex items-center justify-center gap-2.5 rounded-[16px] bg-muted/70 px-3.5 py-2.5 text-[13px]">
        <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        Waiting for the payment…
      </div>
    </PCard>
  )
}

function WalletSendCard() {
  return (
    <PCard className="h-full">
      <div className="mb-4 text-xl font-semibold">Send money</div>
      <PField select className="min-h-16">
        <span className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">To:</span>
          <span className="grid size-9 place-items-center rounded-full bg-surface-tint text-primary">
            <Wallet className="size-[18px]" strokeWidth={2} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold leading-5">Meridian Supplies</span>
            <span className="block font-mono text-xs text-muted-foreground">USDC · Solana · 7xKX…gAsU</span>
          </span>
        </span>
      </PField>
      <DetailRows
        className="mt-3"
        rows={[
          [
            "You send",
            <span key="s" className="font-semibold">
              {formatMoney(2500, "USD", { cents: "always" })}
            </span>,
          ],
          ["Recipient gets", "2,500.00 USDC"],
          ["Network", "Solana"],
          ["Arrival", "Within minutes"],
        ]}
      />
      <PButton size="lg" className="mt-3 w-full">
        Continue
      </PButton>
    </PCard>
  )
}

export const STABLECOIN_SLOTS: Record<string, Canvas> = {
  "mkt-hero-stablecoin-01": panel(560, 470, surface(<ReceiveCard />)),
  "mkt-ui-stablecoin-receive": panel(600, 290, surface(<DepositsCard />)),
  "mkt-ui-stablecoin-terminal": panel(700, 340, surface(<TerminalCard />)),
  "mkt-ui-stablecoin-qrpay": panel(420, 470, surface(<CounterCard />)),
  "mkt-ui-stablecoin-send": panel(560, 420, surface(<WalletSendCard />)),
}
