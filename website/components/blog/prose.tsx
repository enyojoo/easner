import Link from "next/link"
import { Fragment, type ReactNode } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Info,
  Layers,
} from "lucide-react"
import {
  PRODUCT_PAGES,
  SITE_ORIGIN,
  extractSources,
  withHeadingIds,
  type AnyNode,
  type DocNode,
  type ProductSlug,
} from "@easner/blog-content"
import { Button } from "@/components/ui/button"
import { MarketingLink } from "@/components/marketing/marketing-link"
import { OpenAccountButton } from "@/components/marketing/open-account-dialog"
import { highlight } from "@/lib/blog/highlight"
import { mediaUrl } from "@/lib/blog/urls"
import { NAV_SECTIONS } from "@/lib/nav-config"
import { CopyButton } from "./copy-button"
import { EmbedFacade } from "./embed-facade"
import { HeadingAnchor } from "./heading-anchor"
import { LightboxImage } from "./lightbox-image"

/**
 * The post renderer: maps every node type in @easner/blog-content to the WebProse design. Server components only,
 * no `dangerouslySetInnerHTML`: the document is data, never HTML. Interactive pieces are small client islands
 * (copy, enlarge, embed facade, heading anchor).
 */

interface Ctx {
  slug: string
}

const CALLOUT_ICON = { info: Info, warning: AlertTriangle, success: CheckCircle2 } as const

/** Whether Next may optimise an image: only files on our own storage host or in /public. */
function optimizable(src: string): boolean {
  if (src.startsWith("/")) return false
  const base = process.env.SUPABASE_URL
  return Boolean(base && src.startsWith(new URL(base).origin))
}

function internalPath(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href
  if (href.startsWith(SITE_ORIGIN)) return href.slice(SITE_ORIGIN.length) || "/"
  return null
}

function Inline({ nodes }: { nodes?: AnyNode[] }) {
  return (
    <>
      {(nodes ?? []).map((node, i) => {
        if (node.type === "hardBreak") return <br key={i} />
        let out: ReactNode = node.text
        for (const mark of node.marks ?? []) {
          if (mark.type === "bold") out = <strong>{out}</strong>
          else if (mark.type === "italic") out = <em>{out}</em>
          else if (mark.type === "underline") out = <u>{out}</u>
          else if (mark.type === "strike") out = <s>{out}</s>
          else if (mark.type === "code") out = <code>{out}</code>
          else if (mark.type === "link") {
            const href = String(mark.attrs?.href ?? "")
            const path = internalPath(href)
            if (path) out = <Link href={path}>{out}</Link>
            else if (href.startsWith("mailto:")) out = <a href={href}>{out}</a>
            else {
              const rel = mark.attrs?.sponsored ? "sponsored noopener" : "noopener"
              out = (
                <a href={href} target="_blank" rel={rel}>
                  {out}
                </a>
              )
            }
          }
        }
        return <Fragment key={i}>{out}</Fragment>
      })}
    </>
  )
}

const productLine = (path: string) =>
  NAV_SECTIONS.flatMap((s) => s.items).find((item) => item.href === path)?.description ?? ""

function CtaBlock({ node, ctx }: { node: AnyNode; ctx: Ctx }) {
  const a = (node.attrs ?? {}) as { variant: string; heading?: string; body?: string; label?: string; href?: string }
  const location = `blog_cta_${ctx.slug}`
  const heading =
    a.heading ??
    { "open-account": "Open an Easner account", "download-app": "Get the Easner app", "book-call": "Talk to our team", custom: "" }[a.variant]
  let action: ReactNode
  if (a.variant === "open-account") action = <OpenAccountButton ctaLocation={location} showArrow />
  else {
    const preset = { "download-app": ["Download the app", "/app"], "book-call": ["Book a call", "/contact"] }[a.variant] ?? ["Learn more", "/contact"]
    const label = a.label ?? preset[0]
    const href = a.href ?? preset[1]
    action = (
      <Button asChild variant="primary" pill>
        <MarketingLink href={href} external={!internalPath(href)} analyticsLocation={location} ctaLabel={label}>
          {label}
          <ArrowRight className="h-4 w-4" />
        </MarketingLink>
      </Button>
    )
  }
  return (
    <div className="bp-cta">
      <div>
        {heading && <h3 className="bp-h">{heading}</h3>}
        {a.body && <p>{a.body}</p>}
      </div>
      {action}
    </div>
  )
}

function renderImage(node: AnyNode, key: number) {
  const a = node.attrs as { src: string; alt: string; caption?: string; width: "column" | "wide" | "full"; widthPx?: number; heightPx?: number }
  const src = mediaUrl(a.src)
  return (
    <LightboxImage
      key={key}
      src={src}
      alt={a.alt}
      caption={a.caption}
      width={a.widthPx ?? 1600}
      height={a.heightPx ?? 900}
      layout={a.width}
      optimize={optimizable(src)}
    />
  )
}

function Blocks({ nodes, ctx }: { nodes?: AnyNode[]; ctx: Ctx }) {
  return <>{(nodes ?? []).map((node, i) => renderBlock(node, i, ctx))}</>
}

function renderBlock(node: AnyNode, key: number, ctx: Ctx): ReactNode {
  const a = node.attrs ?? {}
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key}>
          <Inline nodes={node.content} />
        </p>
      )
    case "heading": {
      const level = Number(a.level ?? 2) as 2 | 3 | 4
      const Tag = `h${level}` as "h2" | "h3" | "h4"
      const id = String(a.id ?? "")
      return (
        <Tag key={key} id={id}>
          {level < 4 && id && <HeadingAnchor id={id} label={(node.content ?? []).map((n) => n.text ?? "").join("")} />}
          <Inline nodes={node.content} />
        </Tag>
      )
    }
    case "bulletList":
      return (
        <ul key={key}>
          {(node.content ?? []).map((item, i) => (
            <li key={i}>
              <Blocks nodes={item.content} ctx={ctx} />
            </li>
          ))}
        </ul>
      )
    case "orderedList":
      return (
        <ol key={key}>
          {(node.content ?? []).map((item, i) => (
            <li key={i}>
              <Blocks nodes={item.content} ctx={ctx} />
            </li>
          ))}
        </ol>
      )
    case "taskList":
      return (
        <ul key={key} className="bp-tasks">
          {(node.content ?? []).map((item, i) => (
            <li key={i}>
              <input type="checkbox" checked={Boolean(item.attrs?.checked)} readOnly disabled aria-label={item.attrs?.checked ? "Done" : "Not done"} />
              <div>
                <Blocks nodes={item.content} ctx={ctx} />
              </div>
            </li>
          ))}
        </ul>
      )
    case "blockquote":
      return (
        <blockquote key={key}>
          <Blocks nodes={node.content} ctx={ctx} />
          {a.attribution ? <cite>{String(a.attribution)}</cite> : null}
        </blockquote>
      )
    case "codeBlock": {
      const code = (node.content ?? []).map((t) => t.text ?? "").join("")
      const language = typeof a.language === "string" ? a.language : undefined
      return (
        <div key={key} className={language ? "bp-pre has-lang" : "bp-pre"}>
          {language && <span className="lang">{language}</span>}
          <CopyButton text={code} />
          <pre tabIndex={0}>
            <code>
              {highlight(code, language).map((token, i) =>
                token.kind === "plain" ? token.text : <span key={i} className={token.kind}>{token.text}</span>,
              )}
            </code>
          </pre>
        </div>
      )
    }
    case "horizontalRule":
      return <hr key={key} />
    case "image":
      return renderImage(node, key)
    case "table":
      return (
        <div key={key} className="bp-tbl" role="region" aria-label="Table" tabIndex={0}>
          <table>
            <tbody>
              {(node.content ?? []).map((row, r) => (
                <tr key={r}>
                  {(row.content ?? []).map((cell, c) => {
                    const Cell = cell.type === "tableHeader" ? "th" : "td"
                    const attrs = (cell.attrs ?? {}) as { colspan?: number; rowspan?: number; align?: "left" | "center" | "right" }
                    return (
                      <Cell key={c} colSpan={attrs.colspan} rowSpan={attrs.rowspan} style={attrs.align ? { textAlign: attrs.align } : undefined} scope={Cell === "th" ? "col" : undefined}>
                        <Inline nodes={cell.content?.[0]?.content} />
                      </Cell>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case "callout": {
      const variant = (a.variant as keyof typeof CALLOUT_ICON) ?? "info"
      const Icon = CALLOUT_ICON[variant] ?? Info
      return (
        <div key={key} className={`bp-callout ${variant}`} role="note">
          <Icon size={18} aria-hidden="true" />
          <div>
            <Blocks nodes={node.content} ctx={ctx} />
          </div>
        </div>
      )
    }
    case "summary":
      return (
        <div key={key} id="summary" className="bp-summary aeo-answer">
          <span className="k">Summary</span>
          <Blocks nodes={node.content} ctx={ctx} />
        </div>
      )
    case "keyTakeaways":
      return (
        <div key={key} className="bp-take">
          <h3 className="bp-h">Key takeaways</h3>
          <Blocks nodes={node.content} ctx={ctx} />
        </div>
      )
    case "faq":
      return (
        <div key={key} className="bp-faq">
          {(node.content ?? []).map((item, i) => (
            <details key={i} open={i === 0}>
              <summary>
                {String(item.attrs?.question ?? "")}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <div className="ans">
                <Blocks nodes={item.content} ctx={ctx} />
              </div>
            </details>
          ))}
        </div>
      )
    case "steps":
      return (
        <Fragment key={key}>
          <ol className="bp-steps" aria-label={typeof a.name === "string" ? a.name : "Steps"}>
            {(node.content ?? []).map((step, i) => (
              <li key={i}>
                <div className="st">
                  <b>{String(step.attrs?.name ?? "")}</b>
                  <Blocks nodes={step.content} ctx={ctx} />
                </div>
              </li>
            ))}
          </ol>
        </Fragment>
      )
    case "definition":
      return (
        <dl key={key} className="bp-defn">
          <dt>{String(a.term ?? "")}</dt>
          <dd>
            <Blocks nodes={node.content} ctx={ctx} />
          </dd>
        </dl>
      )
    case "cta":
      return <CtaBlock key={key} node={node} ctx={ctx} />
    case "productCard": {
      const product = PRODUCT_PAGES[a.product as ProductSlug]
      if (!product) return null
      return (
        <Link key={key} href={product.path} className="bp-prod">
          <span className="pi">
            <Layers size={20} aria-hidden="true" />
          </span>
          <div>
            <b>{product.label}</b>
            <span>{productLine(product.path)}</span>
          </div>
          <ArrowRight className="go" size={18} aria-hidden="true" />
        </Link>
      )
    }
    case "embed":
      return <EmbedFacade key={key} provider={a.provider as never} url={String(a.url)} title={typeof a.title === "string" ? a.title : undefined} />
    case "sources":
      return (
        <div key={key} className="bp-src">
          <h3 className="bp-h">Sources</h3>
          <ol>
            {(node.content ?? []).map((item, i) => (
              <li key={i}>
                <a href={String(item.attrs?.url)} target="_blank" rel="noopener">
                  {String(item.attrs?.title)}
                </a>
                {item.attrs?.publisher ? `, ${String(item.attrs.publisher)}` : ""}
              </li>
            ))}
          </ol>
        </div>
      )
    case "button": {
      const href = String(a.href ?? "")
      const label = String(a.label ?? "")
      return (
        <div key={key}>
          <Button asChild variant="primary" pill className="bp-btn">
            <MarketingLink href={href} external={!internalPath(href)} analyticsLocation={`blog_button_${ctx.slug}`} ctaLabel={label}>
              {label}
              <ArrowRight className="h-4 w-4" />
            </MarketingLink>
          </Button>
        </div>
      )
    }
    default:
      return null
  }
}

/** A post body. The doc must already have passed `validateDoc`. Heading ids come from `withHeadingIds`, so anchors match the table of contents. */
export function Prose({ doc, slug }: { doc: DocNode; slug: string }) {
  const withIds = withHeadingIds(doc)
  return (
    <div className="blog-prose">
      <Blocks nodes={withIds.content} ctx={{ slug }} />
    </div>
  )
}

export { extractSources }

/** Short inline rich text (author bio, category intro): paragraphs with marks only. Accepts a doc or a plain string. */
export function RichText({ value, className }: { value: DocNode | string | null; className?: string }) {
  if (!value) return null
  if (typeof value === "string") return <p className={className}>{value}</p>
  return (
    <>
      {value.content
        .filter((block) => block.type === "paragraph")
        .map((block, i) => (
          <p key={i} className={className}>
            <Inline nodes={(block as AnyNode).content} />
          </p>
        ))}
    </>
  )
}
