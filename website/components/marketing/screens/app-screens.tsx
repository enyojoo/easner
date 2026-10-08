/**
 * Easner app screens for the website, ported from the design-system cards at native phone size
 * (360 × 760). Wrap in PhoneFrame + ScaledScreen to place them in a slot.
 */
import type { ReactNode } from "react"
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  MessageCircle,
  MonitorSmartphone,
  NotebookPen,
  RotateCcw,
  ArrowUpDown,
  Search,
  ShieldCheck,
} from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { DEMO_PERSONAL, DEMO_RECIPIENTS, DEMO_SEND, type DemoTransaction } from "@/lib/marketing/demo-data"
import { formatMoney, formatRate } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import {
  AppScreen,
  BackHeader,
  CHROME,
  CtaPill,
  DetailRow,
  Keypad,
  Overline,
  PLATE,
  RecipientAvatar,
  TabBar,
  TransactionRow,
  type AppBrand,
} from "./app-parts"

/* ---------------------------------------------------------------- Home (AppHome) */

interface AppHomeScreenProps {
  balance?: number
  transactions?: DemoTransaction[]
  /** White-label: the partner's name and colour replace Easner's (WebPartnerShowcase). */
  brand?: AppBrand
  footnote?: ReactNode
}

export function AppHomeScreen({
  balance = DEMO_PERSONAL.balances[0].amount,
  transactions = DEMO_PERSONAL.transactions,
  brand,
  footnote,
}: AppHomeScreenProps) {
  return (
    <AppScreen brand={brand}>
      <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
        {brand ? (
          <span className="flex items-center gap-2.5 text-base font-bold leading-5 tracking-[-0.2px]">
            <span className="grid size-8 place-items-center rounded-[10px] bg-app-primary text-[15px] font-bold text-white">
              {brand.initial}
            </span>
            {brand.name}
          </span>
        ) : (
          <span className={cn(CHROME, "text-sm font-bold")}>{DEMO_PERSONAL.initials}</span>
        )}
        {brand ? (
          <span className={cn(CHROME, "text-sm font-bold")}>{DEMO_PERSONAL.initials}</span>
        ) : (
          <span className={CHROME}>
            <MessageCircle className="size-[22px]" strokeWidth={2} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="pt-3">
        <div className="mx-5 mb-3 rounded-[24px] bg-[linear-gradient(135deg,var(--app-hero-start),var(--app-hero-end))] p-5 text-white shadow-[var(--app-shadow-sm)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-app-on-hero-fill px-3 text-sm font-semibold leading-5">
              <CurrencyFlag code="USD" size={22} />
              USD Balance
              <ChevronDown className="size-4" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-app-on-hero-fill">
              <Eye className="size-5" strokeWidth={2} aria-hidden="true" />
            </span>
          </div>
          <div className="mb-6 mt-5 text-[54px] font-bold leading-[62px] tracking-[-1px]">
            <Amount value={balance} cents="always" minor="display" />
          </div>
          <div className="flex gap-3">
            <span className="grid h-[52px] flex-1 place-items-center rounded-full bg-white text-[15px] font-semibold text-app-primary">
              Add money
            </span>
            <span className="grid h-[52px] flex-1 place-items-center rounded-full bg-app-on-hero-fill text-[15px] font-semibold shadow-[inset_0_0_0_1px_var(--app-on-hero-border)]">
              Send money
            </span>
          </div>
        </div>
        <div className={cn(PLATE, "mx-5 mt-2 rounded-[20px] py-2")}>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[15px] font-semibold leading-[21px] tracking-[-0.1px]">Recent transactions</span>
            <span className="inline-flex items-center gap-1 rounded-[14px] bg-app-primary-tint-subtle py-1.5 pl-3 pr-2 text-[13px] font-semibold leading-4 text-app-primary-text">
              All
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </span>
          </div>
          <Overline className="px-4 py-2">Today</Overline>
          {transactions.map((tx, index) => (
            <TransactionRow key={tx.name} tx={tx} divider={index > 0} />
          ))}
        </div>
        {footnote && (
          <p className="mt-3 text-center text-[11px] font-medium leading-[14px] text-app-text-secondary">{footnote}</p>
        )}
      </div>
      <TabBar />
    </AppScreen>
  )
}

/* ---------------------------------------------------------------- Send: recipients (AppSend step 1) */

export function AppSendRecipientsScreen() {
  return (
    <AppScreen>
      <BackHeader title="Send money" />
      <div className="px-5">
        <div className="flex h-[42px] items-center gap-2.5 rounded-full bg-app-plate px-4 text-sm text-app-text-secondary shadow-[inset_0_0_0_0.5px_var(--app-hairline)]">
          <Search className="size-[18px] text-app-primary" strokeWidth={2} aria-hidden="true" />
          Search @easetag or recipients
        </div>
        <Overline className="mb-2 mt-5">Recent</Overline>
        <div className={cn(PLATE, "rounded-[20px]")}>
          {DEMO_RECIPIENTS.slice(0, 3).map((recipient, index) => (
            <RecipientRow key={recipient.name} recipient={recipient} divider={index > 0} />
          ))}
        </div>
        <Overline className="mb-2 mt-5">All recipients</Overline>
        <div className={cn(PLATE, "rounded-[20px]")}>
          {DEMO_RECIPIENTS.slice(3).map((recipient, index) => (
            <RecipientRow key={recipient.name} recipient={recipient} divider={index > 0} />
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-app-canvas px-5 pb-9 pt-3">
        <div className="grid h-[52px] place-items-center rounded-full bg-app-primary text-[15px] font-semibold text-white">
          Add a recipient
        </div>
      </div>
    </AppScreen>
  )
}

function RecipientRow({ recipient, divider }: { recipient: (typeof DEMO_RECIPIENTS)[number]; divider: boolean }) {
  return (
    <div className="relative flex h-[76px] items-center gap-3 px-4">
      {divider && <span className="absolute left-[76px] right-0 top-0 h-[0.5px] bg-app-hairline" />}
      <RecipientAvatar
        country={"country" in recipient ? recipient.country : undefined}
        initials={"initials" in recipient ? recipient.initials : undefined}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-5">{recipient.name}</div>
        <div className="truncate text-xs leading-[18px] text-app-text-secondary">{recipient.detail}</div>
      </div>
      <ChevronRight className="size-[18px] text-app-text-tertiary" strokeWidth={2} aria-hidden="true" />
    </div>
  )
}

/* ---------------------------------------------------------------- Send: amount (AppSend step 2) */

export function AppSendAmountScreen() {
  const { recipient } = DEMO_SEND
  return (
    <AppScreen>
      <BackHeader title="Send money" />
      <div className="mx-auto mt-1 flex h-14 w-[85%] items-center gap-2.5 rounded-[24px] bg-app-plate px-4 shadow-[inset_0_0_0_0.5px_var(--app-hairline)]">
        <span className="text-sm text-app-text-secondary">To:</span>
        <RecipientAvatar country={recipient.country} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-5">{recipient.name}</div>
          <div className="truncate text-xs leading-4 text-app-text-secondary">{recipient.detail}</div>
        </div>
        <RotateCcw className="size-[18px]" strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="grid h-[108px] place-items-center text-[65px] font-bold leading-none tracking-[-1px] tabular-nums">
        {formatMoney(DEMO_SEND.receiveAmount, DEMO_SEND.receiveCurrency)}
      </div>
      <div className="mx-auto flex h-8 items-center gap-1.5 rounded-full bg-app-primary-tint-subtle px-3 text-[13px] font-medium text-app-primary-text">
        <ArrowUpDown className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
        Sending: {formatMoney(DEMO_SEND.sendAmount, "USD")} • Rate: {formatRate("USD", DEMO_SEND.receiveCurrency, DEMO_SEND.rate)}
      </div>
      <div className="mx-auto mt-4 flex h-12 min-w-[180px] items-center justify-center gap-2.5 rounded-full bg-app-plate px-4 text-sm font-medium shadow-[inset_0_0_0_0.5px_var(--app-hairline)]">
        <CurrencyFlag code="USD" size={24} />
        USD Balance
        <ChevronDown className="size-4" strokeWidth={2.25} aria-hidden="true" />
      </div>
      <div className="mx-5 mb-4 mt-5 flex h-10 items-center gap-2.5 rounded-full bg-app-plate px-4 text-[13px] text-app-text-secondary shadow-[inset_0_0_0_0.5px_var(--app-hairline)]">
        <NotebookPen className="size-4" strokeWidth={2} aria-hidden="true" />
        Add a note
      </div>
      <Keypad />
      <div className="px-5 pt-4">
        <CtaPill>Continue</CtaPill>
      </div>
    </AppScreen>
  )
}

/* ---------------------------------------------------------------- Review (AppSendReview step 3) */

export function AppSendReviewScreen() {
  const { recipient } = DEMO_SEND
  const total = DEMO_SEND.sendAmount + DEMO_SEND.fee
  return (
    <AppScreen>
      <BackHeader title="Review transfer" />
      <div className={cn(PLATE, "mx-5 rounded-[20px] px-4 py-1")}>
        <DetailRow label="Sending amount" divider={false}>
          <span className="font-semibold">{formatMoney(DEMO_SEND.sendAmount, "USD", { cents: "always" })}</span>
        </DetailRow>
        <DetailRow label="Processing fee">{formatMoney(DEMO_SEND.fee, "USD", { cents: "always" })}</DetailRow>
        <DetailRow label="Exchange rate">{formatRate("USD", DEMO_SEND.receiveCurrency, DEMO_SEND.rate)}</DetailRow>
        <DetailRow label="Total debited">
          <span className="font-semibold">{formatMoney(-total, "USD", { cents: "always" })}</span>
        </DetailRow>
        <DetailRow label="Debited from">
          <span className="inline-flex items-center gap-2">
            <CurrencyFlag code="USD" size={22} />
            USD Balance
          </span>
        </DetailRow>
        <DetailRow label="Recipient amount">
          <span className="font-semibold">
            {formatMoney(DEMO_SEND.receiveAmount, DEMO_SEND.receiveCurrency, { cents: "always" })}
          </span>
        </DetailRow>
        <DetailRow label="Recipient">
          <span className="inline-flex items-center gap-3">
            <span className="grid justify-items-end">
              <span className="text-[15px] font-semibold leading-5">{recipient.name}</span>
              <span className="text-xs leading-4 text-app-text-secondary">{recipient.detail}</span>
            </span>
            <RecipientAvatar country={recipient.country} size={36} />
          </span>
        </DetailRow>
        <DetailRow label="Transfer method">{DEMO_SEND.method}</DetailRow>
        <DetailRow label="Arrival">{DEMO_SEND.arrival}</DetailRow>
        <DetailRow label="Note">{DEMO_SEND.note}</DetailRow>
        <div className="relative flex items-center gap-1.5 py-3 text-xs text-app-text-secondary">
          <span className="absolute inset-x-0 top-0 h-[0.5px] bg-app-hairline" />
          <Clock className="size-3.5" strokeWidth={2} aria-hidden="true" />
          Rate held for 4:59
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 px-5 pb-10">
        <CtaPill>Confirm and send</CtaPill>
      </div>
    </AppScreen>
  )
}

/* ---------------------------------------------------------------- Receive details (AppSendReview rows + CopyField) */

export function AppReceiveScreen() {
  return (
    <AppScreen>
      <BackHeader title="Receive money" />
      <div className="mx-5 flex rounded-full bg-app-plate p-1 shadow-[inset_0_0_0_0.5px_var(--app-hairline)]">
        <span className="grid h-10 flex-1 place-items-center rounded-full bg-app-primary text-sm font-semibold text-white">
          Bank account
        </span>
        <span className="grid h-10 flex-1 place-items-center text-sm font-semibold text-app-text-secondary">Stablecoin</span>
      </div>
      <div className="mx-5 mt-4 flex items-center gap-3">
        <CurrencyFlag code="USD" size={36} />
        <div>
          <div className="text-[15px] font-semibold leading-5">USD account details</div>
          <div className="text-xs leading-[18px] text-app-text-secondary">For ACH and wire transfers in the US</div>
        </div>
      </div>
      <div className={cn(PLATE, "mx-5 mt-4 rounded-[20px] px-4 py-1")}>
        {[
          ["Account name", DEMO_PERSONAL.name],
          ["Account number", "•••• 4821"],
          ["Routing number", "•••• 0021"],
          ["Account type", "Checking"],
        ].map(([label, value], index) => (
          <DetailRow key={label} label={label} divider={index > 0}>
            <span className="inline-flex items-center gap-2.5 font-medium">
              <span className={label !== "Account name" && label !== "Account type" ? "font-mono text-sm" : undefined}>
                {value}
              </span>
              {label !== "Account type" && <Copy className="size-4 text-app-primary" strokeWidth={2} aria-hidden="true" />}
            </span>
          </DetailRow>
        ))}
      </div>
      <p className="mx-6 mt-4 text-xs leading-[18px] text-app-text-secondary">
        Share these details to get paid in USD. Payments land in your USD Balance.
      </p>
      <div className="absolute inset-x-0 bottom-0 px-5 pb-10">
        <div className="grid h-[52px] place-items-center rounded-full bg-app-primary text-[15px] font-semibold text-white">
          Share details
        </div>
      </div>
    </AppScreen>
  )
}

/* ---------------------------------------------------------------- Security (AppMore, Security section) */

export function AppSecurityScreen() {
  const rows = [
    { Icon: Fingerprint, title: "Face ID", subtitle: "Unlock and confirm sends", control: <Toggle /> },
    { Icon: KeyRound, title: "Change PIN", subtitle: "Update your app unlock PIN" },
    { Icon: Lock, title: "Change password", subtitle: "Reset your login password securely" },
    { Icon: ShieldCheck, title: "Two-factor authentication", subtitle: "Confirms sign-in and sends", control: <OnPill /> },
    { Icon: MonitorSmartphone, title: "Signed-in devices", subtitle: "Phones and browsers on your account" },
  ]
  return (
    <AppScreen>
      <div className="px-5 pb-3 pt-4 text-[28px] font-bold leading-[35px] tracking-[-0.3px]">More</div>
      <Overline className="mx-6 mb-2 mt-2">Security</Overline>
      <div className={cn(PLATE, "mx-5 rounded-[20px]")}>
        {rows.map(({ Icon, title, subtitle, control }, index) => (
          <div key={title} className="relative flex min-h-[72px] items-center gap-3 px-4 py-3.5">
            {index > 0 && <span className="absolute left-16 right-0 top-0 h-[0.5px] bg-app-hairline" />}
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-app-primary-tint text-app-primary-text">
              <Icon className="size-[18px]" strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-5">{title}</div>
              <div className="text-xs leading-[18px] text-app-text-secondary">{subtitle}</div>
            </div>
            {control}
            {!(control && title === "Face ID") && (
              <ChevronRight className="size-[18px] text-app-text-tertiary" strokeWidth={2} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <TabBar active="More" />
    </AppScreen>
  )
}

function Toggle() {
  return (
    <span className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-app-primary">
      <span className="absolute left-[22px] top-0.5 size-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]" />
    </span>
  )
}

function OnPill() {
  return (
    <span className="rounded-[14px] bg-app-success-surface px-2 py-px text-[11px] font-semibold leading-[14px] text-app-success-text">
      On
    </span>
  )
}
