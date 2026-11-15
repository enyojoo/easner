import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Fragment } from "react"

/** Visible breadcrumb ("Blog › Category"). The structured-data BreadcrumbList is emitted by the page. */
export function Breadcrumb({ items }: { items: { label: string; href?: string; accent?: boolean }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px] font-medium leading-[18px] text-web-meta">
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
          {item.href ? (
            <Link
              href={item.href}
              className={item.accent ? "inline-block max-md:-my-3 max-md:py-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary-text hover:underline" : "inline-block max-md:-my-3 max-md:py-3 hover:text-web-ink"}
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
