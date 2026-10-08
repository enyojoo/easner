/** Homepage audience tabs (design system: AppHome, BizAccounts, BizConsoleDeveloper, WebPartnerShowcase). */
import { ArrowLeftRight, MoreVertical, Plus } from "lucide-react"
import { Amount } from "@/components/ds/amount"
import { CurrencyFlag } from "@/components/ds/currency-flag"
import { AppHomeScreen } from "../app-screens"
import { at, phoneCard, type Canvas } from "../canvas"
import { PHONE_CANVAS } from "../frames"
import { PartnerBrandPanel, PartnerPhone } from "../partner-showcase"
import { PButton, PCard, surface } from "../web-parts"
import { WorkbenchCard } from "./developers"

/** One currency balance on Accounts (design system: AccountCard). */
export function AccountCard({
  currency,
  label,
  amount,
  incoming,
}: {
  currency: string
  label: string
  amount: number
  incoming?: number
}) {
  return (
    <PCard className="grid gap-4">
      <div className="flex items-center gap-3">
        <CurrencyFlag code={currency} size={36} />
        <span className="flex-1 text-base font-semibold">{label}</span>
        <MoreVertical className="size-5 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="flex items-center justify-between text-[13px] text-muted-foreground">
        Available balance
        {incoming ? (
          <span>
            <Amount value={incoming} signed className="font-medium" /> incoming
          </span>
        ) : null}
      </div>
      <div className="-mt-2 text-[32px] font-semibold leading-10 tracking-[-0.015em]">
        <Amount value={amount} currency={currency} cents="always" minor="display" />
      </div>
      <div className="flex gap-2">
        <PButton variant="outline" icon={Plus} size="sm" className="flex-1">
          Add money
        </PButton>
        <PButton variant="outline" icon={ArrowLeftRight} size="sm" className="flex-1">
          Move
        </PButton>
      </div>
    </PCard>
  )
}

export const HOME_SLOTS: Record<string, Canvas> = {
  "mkt-persona-diaspora": {
    width: 760,
    height: 570,
    render: () => <>{at(180, 0, phoneCard(<AppHomeScreen />, 570).render())}</>,
    mobile: phoneCard(<AppHomeScreen />),
  },
  "mkt-persona-sme": {
    width: 860,
    height: 640,
    render: () =>
      surface(
        <>
          {at(
            30,
            40,
            <div className="w-[400px]">
              <AccountCard currency="USD" label="USD Balance" amount={24190.32} incoming={1250} />
            </div>,
            1,
          )}
          {at(
            430,
            120,
            <div className="w-[400px]">
              <AccountCard currency="EUR" label="EUR Balance" amount={12480} />
            </div>,
            2,
          )}
          {at(
            130,
            330,
            <div className="w-[400px]">
              <AccountCard currency="GBP" label="GBP Balance" amount={4870.22} />
            </div>,
            3,
          )}
        </>,
      ),
    mobile: {
      width: 460,
      height: 340,
      render: () =>
        surface(
          at(
            30,
            30,
            <div className="w-[400px]">
              <AccountCard currency="USD" label="USD Balance" amount={24190.32} incoming={1250} />
            </div>,
          ),
        ),
    },
  },
  "mkt-persona-otc": {
    width: 800,
    height: 600,
    render: () => (
      <>
        {at(10, 10, <PartnerPhone />, 1)}
        {at(400, 70, <PartnerBrandPanel className="w-[370px]" />, 2)}
      </>
    ),
    mobile: { width: PHONE_CANVAS.width, height: 520, render: () => at(0, 10, <PartnerPhone />) },
  },
  "mkt-persona-dev": {
    width: 760,
    height: 620,
    render: () =>
      surface(
        at(
          40,
          30,
          <div className="h-[560px] w-[680px]">
            <WorkbenchCard />
          </div>,
        ),
      ),
  },
}
