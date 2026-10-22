import { Fragment } from "react"
import {
  pricingAccentForName,
  pricingComparison,
  pricingFeeLine,
  pricingPlanNames,
} from "@/lib/marketing/content/pricing"

const featureCell = "sticky left-0 z-10 min-w-[8.75rem] bg-web-canvas px-3 py-3 text-left font-normal text-web-ink shadow-[1px_0_0_var(--web-hairline)] sm:px-4"
const valueCell = "min-w-[7rem] border-b border-web-divider px-3 py-3 align-top text-web-body sm:px-4"

export function PricingComparison() {
  return (
    <>
      <nav aria-label="Compare plans" className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-7 sm:px-6 lg:px-8">
        {pricingComparison.map((group) => (
          <a key={group.id} href={`#${group.id}`} className="py-2 text-sm font-semibold text-web-link underline-offset-4 hover:underline">
            {group.label}
          </a>
        ))}
      </nav>
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <div className="max-h-[70vh] overflow-auto overscroll-x-contain rounded-xl border border-web-hairline bg-web-canvas lg:max-h-none lg:overflow-visible">
          <table className="w-full min-w-[37rem] border-separate border-spacing-0 text-sm leading-5 lg:min-w-full">
            <thead className="sticky top-0 z-30 lg:top-16">
              <tr>
                <th scope="col" className="sticky left-0 z-40 h-12 min-w-[8.75rem] bg-web-plate px-3 text-left shadow-[1px_0_0_var(--web-hairline)] sm:px-4">
                  <span className="sr-only">Feature</span>
                </th>
                {pricingPlanNames.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className={`h-12 min-w-[7rem] bg-web-plate px-3 text-left text-[13px] font-semibold leading-[18px] sm:px-4 ${pricingAccentForName(name)?.header ?? "text-web-ink"}`}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingComparison.map((group) => (
                <Fragment key={group.id}>
                  <tr id={group.id} className="scroll-mt-32">
                    <th
                      scope="colgroup"
                      colSpan={5}
                      className="sticky top-12 z-20 border-b border-web-divider bg-web-band p-0 text-left lg:static"
                    >
                      <span className="sticky left-0 inline-block px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-web-meta sm:px-4">
                        {group.label}
                      </span>
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className={`${featureCell} border-b border-web-divider`}>
                        {row.label}
                      </th>
                      {row.cells.map((cell, index) => (
                        <td key={`${row.label}-${pricingPlanNames[index]}`} className={valueCell}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-web-meta">{pricingFeeLine}</p>
      </div>
    </>
  )
}
