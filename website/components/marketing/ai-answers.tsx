"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { Headline } from "@/components/ds/headline"
import { aiSections, type AiAnswerSection } from "@/lib/marketing/content/ai"
import { cn } from "@/lib/utils"
import { MarketingLink } from "./marketing-link"

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function extraFaqs(section: AiAnswerSection) {
  return (section.faq ?? []).filter((item) => item.question !== section.definition.question)
}

function groupLabel(section: AiAnswerSection) {
  if (section.href === "/") return "Easner"
  if (section.href === "/about") return "Company"
  return section.label
}

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query)
}

function sectionMatches(section: AiAnswerSection, query: string) {
  if (!query) return true
  const faqs = extraFaqs(section)
  const blob = [
    groupLabel(section),
    section.definition.question,
    section.definition.answer,
    ...(section.definition.facts ?? []).flatMap((fact) => [fact.term, fact.definition]),
    section.howTo?.name ?? "",
    ...(section.howTo?.steps ?? []).flatMap((step) => [step.name, step.text]),
    ...faqs.flatMap((item) => [item.question, item.answer]),
  ].join(" ")
  return matchesQuery(blob, query)
}

function faqMatches(question: string, answer: string, query: string) {
  if (!query) return true
  return matchesQuery(`${question} ${answer}`, query)
}

function isSearchFocused() {
  return Boolean(document.activeElement?.id?.startsWith("answers-search"))
}

function AnswersSearch({
  id,
  query,
  onQuery,
  onEnter,
}: {
  id: string
  query: string
  onQuery: (value: string) => void
  onEnter: () => void
}) {
  return (
    <div className="group relative">
      <label className="sr-only" htmlFor={id}>
        Search answers
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-web-meta transition-colors group-focus-within:text-brand-primary" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onEnter()
          }
          if (event.key === "Escape") {
            event.preventDefault()
            onQuery("")
          }
        }}
        placeholder="Search answers"
        autoComplete="off"
        className="h-11 w-full appearance-none rounded-[12px] border border-web-hairline bg-web-plate py-2 pl-11 pr-10 text-sm text-web-ink outline-none placeholder:text-web-meta focus:border-brand-primary focus:bg-white focus:placeholder:opacity-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQuery("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-web-meta transition-colors hover:bg-web-plate hover:text-web-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function AiAnswers() {
  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState(slug(aiSections[0]?.definition.term ?? ""))
  const [mobileBarHeight, setMobileBarHeight] = useState(108)
  const mobileBarRef = useRef<HTMLDivElement>(null)
  const needle = query.trim().toLowerCase()

  const visible = useMemo(
    () => aiSections.filter((section) => sectionMatches(section, needle)),
    [needle],
  )

  useEffect(() => {
    const nodes = aiSections
      .map((section) => document.getElementById(slug(section.definition.term)))
      .filter((node): node is HTMLElement => Boolean(node))
    if (nodes.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const id = visibleEntries[0]?.target.id
        if (id) setActiveId(id)
      },
      { rootMargin: "-200px 0px -55% 0px", threshold: 0 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isSearchFocused()) return
    const nav = document.querySelector<HTMLElement>('nav[aria-label="On this page"]')
    const current = nav?.querySelector<HTMLElement>('[aria-current="location"]')
    if (!nav || !current) return
    const navBox = nav.getBoundingClientRect()
    const itemBox = current.getBoundingClientRect()
    if (itemBox.top < navBox.top || itemBox.bottom > navBox.bottom) {
      nav.scrollTop += itemBox.top - navBox.top - 16
    }
  }, [activeId])

  useLayoutEffect(() => {
    const bar = mobileBarRef.current
    if (!bar) return
    const sync = () => setMobileBarHeight(bar.offsetHeight)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [needle, visible.length])

  useLayoutEffect(() => {
    if (!isSearchFocused()) return
    const explorer = document.getElementById("answers-explorer")
    if (!explorer) return
    const offset = window.matchMedia("(min-width: 1024px)").matches ? 72 : 64 + mobileBarHeight
    const top = explorer.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" })
  }, [needle, mobileBarHeight])

  const jumpToFirstMatch = () => {
    const first = visible[0]
    if (!first) return
    const faqs = extraFaqs(first).filter((item) => faqMatches(item.question, item.answer, needle))
    const target =
      needle && faqs[0] && !matchesQuery(`${first.definition.question} ${first.definition.answer}`, needle)
        ? `${slug(first.definition.term)}--${slug(faqs[0].question)}`
        : slug(first.definition.term)
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <article
      className="bg-white pb-6 md:pb-8 [overflow-anchor:none]"
      style={{ ["--answers-bar" as string]: `${mobileBarHeight}px` }}
    >
      <div className="lg:hidden">
        <div
          ref={mobileBarRef}
          className="fixed inset-x-0 top-16 z-30 border-b border-web-hairline bg-white/90 px-4 py-3 backdrop-blur-md"
        >
          <AnswersSearch id="answers-search-mobile" query={query} onQuery={setQuery} onEnter={jumpToFirstMatch} />
          {needle && (
            <p className="mt-2 text-xs leading-5 text-web-meta">
              {visible.length === 0
                ? "No matching answers"
                : visible.length === 1
                  ? "1 topic"
                  : `${visible.length} topics`}
            </p>
          )}
          <nav aria-label="Answers" className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {visible.map((section) => {
              const id = slug(section.definition.term)
              return (
                <a
                  key={section.href}
                  href={`#${id}`}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    activeId === id
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-web-hairline bg-web-plate text-web-nav",
                  )}
                >
                  {groupLabel(section)}
                </a>
              )
            })}
          </nav>
        </div>
        <div aria-hidden style={{ height: mobileBarHeight }} />
      </div>

      <header className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
        <Headline level="page">Answers about Easner</Headline>
        <p className="mt-6 max-w-3xl text-base leading-7 text-web-body sm:text-lg sm:leading-8">
          Direct answers to what Easner is, who it is for, and how each product works. Search, or jump from the list.
          Open a product page for the full experience.
        </p>
      </header>

      <div
        id="answers-explorer"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-12 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-16"
      >
        <aside className="hidden lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-8rem)] lg:flex-col lg:overflow-hidden">
          <div className="shrink-0">
            <AnswersSearch id="answers-search" query={query} onQuery={setQuery} onEnter={jumpToFirstMatch} />
            {needle && (
              <p className="mt-2 text-xs leading-5 text-web-meta">
                {visible.length === 0
                  ? "No matching answers"
                  : visible.length === 1
                    ? "1 topic"
                    : `${visible.length} topics`}
              </p>
            )}
          </div>

          <nav aria-label="On this page" className="mt-8 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-web-meta">On this page</p>
            {visible.length === 0 && (
              <p className="mt-4 text-sm leading-6 text-web-body">No answers match that search.</p>
            )}
            <ul className="mt-4 space-y-5">
              {visible.map((section) => {
                const id = slug(section.definition.term)
                const faqs = extraFaqs(section).filter((item) => faqMatches(item.question, item.answer, needle))
                const sectionActive = activeId === id || activeId.startsWith(`${id}--`)
                return (
                  <li key={section.href}>
                    <p className="text-xs font-semibold uppercase tracking-[0.06em] text-web-meta">
                      {groupLabel(section)}
                    </p>
                    <a
                      href={`#${id}`}
                      aria-current={sectionActive ? "location" : undefined}
                      className={cn(
                        "mt-2 block text-sm leading-5 hover:text-brand-primary",
                        sectionActive ? "font-semibold text-brand-primary" : "text-web-nav",
                      )}
                    >
                      {section.definition.question}
                    </a>
                    {faqs.length > 0 && (
                      <ul className="mt-2 space-y-1.5 border-l border-web-hairline pl-3">
                        {faqs.map((item) => {
                          const faqId = `${id}--${slug(item.question)}`
                          return (
                            <li key={item.question}>
                              <a
                                href={`#${faqId}`}
                                className="block text-[13px] leading-5 text-web-body hover:text-brand-primary"
                              >
                                {item.question}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <div className="min-h-[50vh] min-w-0 pb-8 lg:max-w-3xl lg:pb-4">
          {needle && visible.length === 0 && (
            <p className="py-12 text-base leading-7 text-web-body">
              No answers match “{query.trim()}”. Try bank, fees, payroll, or invoice.
            </p>
          )}
          {aiSections.map((section) => {
            const id = slug(section.definition.term)
            const faqs = extraFaqs(section).filter((item) => faqMatches(item.question, item.answer, needle))
            const showHowTo =
              Boolean(section.howTo) &&
              (!needle ||
                matchesQuery(
                  `${section.howTo?.name ?? ""} ${section.howTo?.steps.map((step) => `${step.name} ${step.text}`).join(" ") ?? ""}`,
                  needle,
                ))
            const show = !needle || sectionMatches(section, needle)
            return (
              <section
                key={section.href}
                id={id}
                hidden={!show}
                className="scroll-mt-[calc(4rem+var(--answers-bar,6.75rem))] border-t border-web-hairline py-12 first:border-t-0 md:py-14 lg:scroll-mt-28"
                aria-labelledby={`${id}-heading`}
              >
                <Headline
                  id={`${id}-heading`}
                  level="section"
                  className="text-[15px] sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl"
                >
                  {section.definition.question}
                </Headline>
                <p className="aeo-answer mt-5 text-base leading-7 text-web-body sm:text-lg">
                  {section.definition.answer}
                </p>
                {section.definition.facts && section.definition.facts.length > 0 && (
                  <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                    {section.definition.facts.map((fact) => (
                      <div key={fact.term} className="rounded-[16px] border border-web-hairline bg-web-plate px-5 py-4">
                        <dt className="text-sm font-semibold text-web-ink">{fact.term}</dt>
                        <dd className="mt-1 text-sm leading-6 text-web-body">{fact.definition}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {section.howTo && showHowTo && (
                  <div className="mt-10">
                    <h3 className="text-sm font-semibold text-web-ink sm:text-base">{section.howTo.name}</h3>
                    <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                      {section.howTo.steps.map((step, stepIndex) => (
                        <li key={step.name} className="rounded-[16px] border border-web-hairline bg-web-plate px-5 py-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                            {stepIndex + 1}
                          </span>
                          <h4 className="mt-3 text-sm font-semibold text-web-ink">{step.name}</h4>
                          <p className="mt-1 text-sm leading-6 text-web-body">{step.text}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {faqs.length > 0 && (
                  <div className="mt-10 space-y-6">
                    {faqs.map((item) => (
                      <div key={item.question} id={`${id}--${slug(item.question)}`} className="scroll-mt-[calc(4rem+var(--answers-bar,6.75rem))] lg:scroll-mt-28">
                        <h3 className="text-sm font-semibold text-web-ink sm:text-base">{item.question}</h3>
                        <p className="mt-2 text-sm leading-6 text-web-body sm:text-base sm:leading-7">{item.answer}</p>
                        {item.links && (
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                            {item.links.map((link) => (
                              <MarketingLink
                                key={link.href}
                                href={link.href}
                                analyticsLocation="ai_faq_related_page"
                                ctaLabel={link.label}
                                className="text-sm font-semibold text-web-link underline underline-offset-4"
                              >
                                {link.label}
                              </MarketingLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-8 text-sm">
                  <MarketingLink
                    href={section.href}
                    analyticsLocation="ai_product_page"
                    ctaLabel={section.label}
                    className="font-semibold text-web-link underline underline-offset-4"
                  >
                    {section.label === "Home" ? "Go to the homepage" : `Open ${section.label}`}
                  </MarketingLink>
                </p>
              </section>
            )
          })}
        </div>
      </div>
    </article>
  )
}
