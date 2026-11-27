"use client"

import { Fragment, type ReactNode } from "react"
import { isBusinessEasnerUrl } from "@/lib/marketing/business-signup-url"
import { isPersonalEasnerUrl } from "@/lib/marketing/personal-app-url"
import { MARKDOWN_LINK } from "@/lib/marketing/answer-text"
import { MarketingLink } from "./marketing-link"
import { PersonalAppLink } from "./personal-app-link"

const TRAILING = /[.,;:!?)]+$/
const TOKEN =
  /(?<![A-Za-z0-9@._%+-])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(https?:\/\/[^\s<>"']+)|(?<![A-Za-z0-9@._-])((?:[a-z0-9-]+\.)*easner\.com(?:\/[^\s<>"']*)?)/gi

const linkClass = "break-all font-semibold text-web-link underline underline-offset-4"

function splitTrailing(raw: string) {
  const core = raw.replace(TRAILING, "")
  const value = core || raw
  return { core: value, suffix: raw.slice(value.length) }
}

function sameSitePath(href: string): string | null {
  try {
    const url = new URL(href.includes("://") ? href : `https://${href}`)
    if (url.hostname.replace(/^www\./, "") !== "easner.com") return null
    return `${url.pathname}${url.search}${url.hash}` || "/"
  } catch {
    return null
  }
}

const wordLinkClass = "font-semibold text-web-link underline underline-offset-4"

/** A link that wraps a word in the sentence: "the [web](https://app.easner.com)". Site paths stay on the site. */
function WordLink({ label, href, analyticsLocation }: { label: string; href: string; analyticsLocation: string }) {
  const path = href.startsWith("/") ? href : sameSitePath(href)
  if (path) {
    return (
      <MarketingLink href={path} analyticsLocation={analyticsLocation} ctaLabel={label} className={wordLinkClass}>
        {label}
      </MarketingLink>
    )
  }
  if (isPersonalEasnerUrl(href)) {
    return (
      <PersonalAppLink campaign={analyticsLocation} ctaLabel={label} href={href} className={wordLinkClass}>
        {label}
      </PersonalAppLink>
    )
  }
  return (
    <MarketingLink href={href} external analyticsLocation={analyticsLocation} ctaLabel={label} className={wordLinkClass}>
      {label}
    </MarketingLink>
  )
}

/** Turns [word](link) into a link on the word, and bare URLs, easner.com addresses, and emails into links. */
export function LinkedText({
  text,
  analyticsLocation = "inline_url",
}: {
  text: string
  analyticsLocation?: string
}) {
  const parts: ReactNode[] = []
  const pattern = new RegExp(MARKDOWN_LINK.source, "g")
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      parts.push(<AutoLinked key={`t${key}`} text={text.slice(last, match.index)} analyticsLocation={analyticsLocation} />)
    }
    parts.push(<WordLink key={`l${key}`} label={match[1]} href={match[2]} analyticsLocation={analyticsLocation} />)
    last = match.index + match[0].length
    key += 1
  }
  if (last < text.length) {
    parts.push(<AutoLinked key={`t${key}`} text={text.slice(last)} analyticsLocation={analyticsLocation} />)
  }
  return <>{parts}</>
}

/** Turns URLs, easner.com addresses, and email addresses in a sentence into links. */
function AutoLinked({
  text,
  analyticsLocation = "inline_url",
}: {
  text: string
  analyticsLocation?: string
}) {
  const nodes: ReactNode[] = []
  const pattern = new RegExp(TOKEN.source, "gi")
  let last = 0
  let match: RegExpExecArray | null
  let index = 0

  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const raw = match[0]
    const { core, suffix } = splitTrailing(raw)
    const email = match[1]

    if (email) {
      const address = splitTrailing(email).core
      nodes.push(
        <MarketingLink
          key={index}
          href={`mailto:${address}`}
          analyticsLocation={analyticsLocation}
          ctaLabel={address}
          className={linkClass}
        >
          {address}
        </MarketingLink>,
      )
    } else {
      const href = core.startsWith("http") ? core : `https://${core}`
      const path = sameSitePath(href)
      if (path) {
        nodes.push(
          <MarketingLink key={index} href={path} analyticsLocation={analyticsLocation} ctaLabel={core} className={linkClass}>
            {core}
          </MarketingLink>,
        )
      } else if (isPersonalEasnerUrl(href)) {
        nodes.push(
          <PersonalAppLink key={index} campaign={analyticsLocation} ctaLabel={core} href={href} className={linkClass}>
            {core}
          </PersonalAppLink>,
        )
      } else {
        nodes.push(
          <MarketingLink
            key={index}
            href={href}
            external
            analyticsLocation={analyticsLocation}
            ctaLabel={core}
            className={linkClass}
          >
            {core}
          </MarketingLink>,
        )
      }
    }

    if (suffix) nodes.push(suffix)
    last = match.index + raw.length
    index += 1
  }

  if (last < text.length) nodes.push(text.slice(last))
  return (
    <>
      {nodes.map((node, nodeIndex) => (
        <Fragment key={nodeIndex}>{node}</Fragment>
      ))}
    </>
  )
}
