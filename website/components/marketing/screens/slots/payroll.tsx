/** Payroll page screens (design system: BizPayroll, BizPayrollPayday, AppPayroll, AppPayStub). */
import { ArrowRight, CalendarClock, Check, CircleCheck, UserRoundCheck, X } from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { StatusBadge, type StatusKey } from "@/components/ds/status-badge"
import { DEMO_BUSINESS } from "@/lib/marketing/demo-data"
import { formatMoney } from "@/lib/marketing/format-money"
import { cn } from "@/lib/utils"
import { AppScreen, BackHeader, Overline as AppOverline, PLATE } from "../app-parts"
import { at, panel, phoneCard, type Canvas } from "../canvas"
import { Avatar, PButton, PCard, surface, TableHead, TableRow } from "../web-parts"

const money = (value: number) => formatMoney(value, "USD", { cents: "always" })

export function NextPaydayCard() {
  return (
    <PCard padded={false}>
      <div className="flex items-start gap-5 p-6">
        <span className="grid h-[84px] w-[76px] shrink-0 content-center justify-items-center rounded-[16px] bg-surface-tint">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary-text">Oct</span>
          <span className="text-[30px] font-bold leading-8">30</span>
          <span className="text-xs text-muted-foreground">Fri</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            Next payday · in 4 days
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Draft</span>
          </div>
          <div className="text-xl font-semibold">Oct 30 payday</div>
          <div className="text-[13px] text-muted-foreground">Monthly · 11 people · Pay period Oct 1 – Oct 31</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-success-surface px-2.5 py-1 text-success-text">
              <CircleCheck className="size-3" strokeWidth={2.25} aria-hidden="true" />
              Funded
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-surface px-2.5 py-1 text-warning-text">
              <UserRoundCheck className="size-3" strokeWidth={2.25} aria-hidden="true" />
              11 of 12 ready
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <CalendarClock className="size-3" strokeWidth={2.25} aria-hidden="true" />
              Approve by Oct 28 • 6:00 PM WAT
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] text-muted-foreground">Total to debit</div>
          <div className="text-[32px] font-bold leading-10 tracking-[-0.015em]">
            <Amount value={48210} cents="always" minor="display" />
          </div>
          <PButton className="mt-2 rounded-full">
            Review payday <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </PButton>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-border/60 px-6 pb-5 pt-4 text-[13px]">
        {[
          ["Drafted", "Oct 25 · Monthly schedule", "done"],
          ["Approve", "By Oct 28 • 6:00 PM WAT", "current"],
          ["Payday", "Oct 30 • 9:00 AM WAT", "next"],
        ].map(([label, sub, state]) => (
          <div key={label} className="relative pt-4">
            <span className={cn("absolute inset-x-0 top-1 h-0.5", state === "done" ? "bg-success" : "bg-border")} />
            <span
              className={cn(
                "absolute left-0 top-0 size-2.5 rounded-full border-2",
                state === "done"
                  ? "border-success bg-success"
                  : state === "current"
                    ? "border-primary bg-card"
                    : "border-border bg-card",
              )}
            />
            <span className="block font-medium">{label}</span>
            <span className="block text-muted-foreground">{sub}</span>
          </div>
        ))}
      </div>
    </PCard>
  )
}

export function RecentPaydays() {
  const template = "64px 1.6fr 0.6fr 1fr 1fr"
  const rows: [string, string, string, string, number, number, StatusKey][] = [
    ["Sep", "30", "Sep 30 payday", "Monthly · Sep 1 – Sep 30", 11, 47312.4, "partially_paid"],
    ["Sep", "12", "Q3 bonus", "Off-cycle · Bonus", 4, 6000, "paid"],
    ["Aug", "29", "Aug 29 payday", "Monthly · Aug 1 – Aug 31", 10, 46880, "paid"],
  ]
  return (
    <PCard padded={false} className="h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-base font-semibold">Recent paydays</span>
        <span className="text-sm font-medium text-primary-text">View all</span>
      </div>
      <TableHead columns={["", "Payday", "People", "Total", "Status"]} template={template} />
      {rows.map(([month, day, name, sub, people, total, status], index) => (
        <TableRow
          key={name}
          divider={index > 0}
          template={template}
          cells={[
            <span
              key="d"
              className="grid size-11 content-center justify-items-center rounded-[12px] bg-surface-tint leading-none"
            >
              <span className="text-[10px] font-semibold uppercase text-primary-text">{month}</span>
              <span className="text-lg font-bold">{day}</span>
            </span>,
            <span key="n">
              <span className="block font-medium leading-5">{name}</span>
              <span className="block text-xs text-muted-foreground">{sub}</span>
            </span>,
            <span key="p">{people}</span>,
            <span key="t" className="font-semibold">
              {money(total)}
            </span>,
            <span key="s" className="flex justify-end">
              <StatusBadge status={status} />
            </span>,
          ]}
        />
      ))}
    </PCard>
  )
}

function ApprovalCard() {
  return (
    <PCard className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold">Approve Oct 30 payday</div>
          <div className="text-[13px] text-muted-foreground">Nothing moves until it is approved.</div>
        </div>
        <StatusBadge status="action_required" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Total to debit", money(48210)],
          ["People", "11 of 12 ready"],
          ["From", "USD Balance"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[16px] bg-muted/60 px-3.5 py-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-[15px] font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {[
          ["AO", "Ada Obi", "Owner · approved Oct 26, 2:14 PM", true],
          ["KM", "Kofi Mensah", "Admin · waiting", false],
        ].map(([initials, name, sub, done]) => (
          <div key={name as string} className="flex items-center gap-3 rounded-[16px] border border-border/70 px-4 py-2.5">
            <Avatar initials={initials as string} className="size-9 text-xs" />
            <span className="flex-1 text-sm">
              <span className="block font-medium">{name}</span>
              <span className="block text-xs text-muted-foreground">{sub}</span>
            </span>
            {done ? (
              <Check className="size-5 text-success-text" strokeWidth={2.25} aria-hidden="true" />
            ) : (
              <span className="text-xs font-medium text-warning-text">Waiting</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <PButton variant="outline">Send back</PButton>
        <PButton>Approve payday</PButton>
      </div>
    </PCard>
  )
}

/** Pay stub sheet in the Easner app (AppPayStub). */
function PayStubScreen() {
  const rows: [string, string][] = [
    ["Paid by", DEMO_BUSINESS.name],
    ["Payday", "Aug 31, 2026"],
    ["Paid on", "Aug 31, 2026 • 9:14 AM"],
    ["Paid to", "GTBank • 0123 4567 89"],
    ["Reference", "PRL-8F2A91"],
  ]
  return (
    <AppScreen>
      <div className="absolute inset-0 bg-app-scrim" />
      <div className="absolute inset-x-0 bottom-0 top-16 rounded-t-[24px] bg-app-plate px-5 pt-2">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-app-hairline" />
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-semibold">Pay stub</span>
          <span className="grid size-9 place-items-center rounded-full shadow-[inset_0_0_0_0.5px_var(--app-hairline)]">
            <X className="size-4" strokeWidth={2} aria-hidden="true" />
          </span>
        </div>
        <div className="my-4 text-center text-[34px] font-bold tracking-[-0.5px]">{money(2450)}</div>
        <AppOverline className="mb-1">Pay</AppOverline>
        {[
          ["Base pay", money(2000)],
          ["Bonus · Q3 target", money(500)],
          ["Deduction · Health plan", formatMoney(-50, "USD", { cents: "always" })],
          ["Net pay", money(2450)],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={cn("flex justify-between border-t border-app-hairline py-2.5 text-[13px]", index === 3 && "font-semibold")}
          >
            <span className={index === 3 ? undefined : "text-app-text-secondary"}>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between border-t border-app-hairline py-2.5 text-[13px]">
            <span className="text-app-text-secondary">{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-app-hairline py-2.5 text-[13px]">
          <span className="text-app-text-secondary">Status</span>
          <span className="font-semibold text-app-success-text">Completed</span>
        </div>
      </div>
    </AppScreen>
  )
}

/** Payroll connection in the Easner app: where you get paid (AppPayroll). */
function PayrollConnectionScreen() {
  const methods = [
    { country: undefined, initials: "@", name: "Easetag", sub: "@adaobi · Recommended" },
    { country: "NG", name: "GTBank", sub: "Bank account • 0123 4567 89", selected: true },
    { country: "GH", name: "MTN MoMo", sub: "Mobile money • +233 24 123 4567" },
  ]
  return (
    <AppScreen>
      <BackHeader title="Payroll connection" />
      <div className={cn(PLATE, "mx-5 flex items-center gap-3 rounded-[20px] p-4")}>
        <span className="grid size-11 place-items-center rounded-full bg-app-primary text-base font-bold text-white">N</span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold">{DEMO_BUSINESS.name}</span>
          <span className="block text-xs text-app-text-secondary">Paid monthly · connected since Mar 12, 2026</span>
        </span>
        <span className="rounded-[14px] bg-app-success-surface px-2 py-0.5 text-[11px] font-semibold text-app-success-text">
          Active
        </span>
      </div>
      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        {[
          ["This year", money(14700)],
          ["Next payday", "Oct 30"],
        ].map(([label, value]) => (
          <div key={label} className={cn(PLATE, "rounded-[20px] px-4 py-3")}>
            <AppOverline>{label}</AppOverline>
            <div className="mt-1 text-[17px] font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <AppOverline className="mx-6 mb-2 mt-5">Where you get paid</AppOverline>
      <div className={cn(PLATE, "mx-5 rounded-[20px]")}>
        {methods.map((method, index) => (
          <div
            key={method.name}
            className={cn("relative flex h-[68px] items-center gap-3 px-4", method.selected && "bg-app-primary-tint-subtle")}
          >
            {index > 0 && <span className="absolute left-16 right-0 top-0 h-[0.5px] bg-app-hairline" />}
            {method.country ? (
              <CurrencyFlag code={method.country} size={36} />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-app-primary-tint text-sm font-bold text-app-primary">
                @
              </span>
            )}
            <span className="flex-1">
              <span className="block text-sm font-semibold">{method.name}</span>
              <span className="block text-xs text-app-text-secondary">{method.sub}</span>
            </span>
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border-2",
                method.selected ? "border-app-primary bg-app-primary" : "border-app-input",
              )}
            >
              {method.selected && <span className="size-2 rounded-full bg-white" />}
            </span>
          </div>
        ))}
      </div>
    </AppScreen>
  )
}

export const PAYROLL_SLOTS: Record<string, Canvas> = {
  "mkt-hero-payroll-01": {
    width: 860,
    height: 600,
    render: () =>
      surface(
        <>
          {at(
            30,
            30,
            <div className="w-[800px]">
              <NextPaydayCard />
            </div>,
            2,
          )}
          {at(
            110,
            300,
            <div className="w-[720px]">
              <RecentPaydays />
            </div>,
            1,
          )}
        </>,
      ),
    mobile: panel(560, 330, surface(<RecentPaydays />)),
  },
  "mkt-ui-payroll-approvals": panel(600, 400, surface(<ApprovalCard />)),
  "mkt-ui-payroll-stubs": phoneCard(<PayStubScreen />, 600),
  "mkt-ui-payroll-mobile": phoneCard(<PayrollConnectionScreen />, 560),
  "mkt-ui-payroll-reconcile": panel(640, 300, surface(<RecentPaydays />)),
}
