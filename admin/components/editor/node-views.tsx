"use client"

/** React node views for the Easner blocks. Each one edits through `updateAttributes`; text stays in the document. */
import { useState, type ReactNode } from "react"
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { AlertTriangle, CheckCircle2, ExternalLink, ImageOff, Info, Play, Plus, X } from "lucide-react"
import { PRODUCT_PAGES, type ProductSlug } from "@easner/blog-content"
import { EditorSelect } from "@/components/editor/editor-select"
import { detectEmbed, embedPlayerSrc, embedPosterSrc, PROVIDER_LABEL, type EmbedInfo } from "@/lib/blog/embed"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-8 w-full rounded-md border border-input bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

function Label({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "info" }) {
  return (
    <div
      contentEditable={false}
      className={cn(
        "select-none text-[11px] font-medium uppercase tracking-[0.08em]",
        tone === "info" ? "text-info-text" : "text-muted-foreground",
      )}
    >
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      {children}
    </label>
  )
}

function Text({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: unknown
  onChange: (value: string) => void
  placeholder?: string
  label: string
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        className={fieldClass}
        value={typeof value === "string" ? value : ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}

const frame = (selected: boolean) =>
  cn("my-4 rounded-lg border border-border bg-card p-4", selected && "ring-2 ring-ring")

/** Removes an item from a container, or the whole container when it was the last item. */
function removeItem({ editor, getPos, node }: Pick<NodeViewProps, "editor" | "getPos" | "node">) {
  const pos = getPos()
  if (typeof pos !== "number") return
  const $pos = editor.state.doc.resolve(pos)
  const parent = $pos.parent
  if (parent.childCount <= 1 && $pos.depth > 0) {
    editor.chain().focus().deleteRange({ from: $pos.before(), to: $pos.after() }).run()
  } else {
    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
  }
}

function appendChild(props: Pick<NodeViewProps, "editor" | "getPos" | "node">, content: Record<string, unknown>) {
  const pos = props.getPos()
  if (typeof pos !== "number") return
  props.editor.chain().focus().insertContentAt(pos + props.node.nodeSize - 1, content).run()
}

// ---------------------------------------------------------------------------------------------------------------
// Text containers
// ---------------------------------------------------------------------------------------------------------------

export function SummaryView({ selected }: NodeViewProps) {
  return (
    <NodeViewWrapper className={cn("my-4 rounded-lg bg-info-surface p-4", selected && "ring-2 ring-ring")} data-block="summary">
      <Label tone="info">Summary</Label>
      <NodeViewContent className="mt-1 text-[15px] leading-6 text-foreground [&_p]:m-0" />
      <p contentEditable={false} className="mt-2 select-none text-xs text-muted-foreground">
        The direct answer, in two or three sentences. It is the speakable text and the meta description fallback.
      </p>
    </NodeViewWrapper>
  )
}

const CALLOUT_STYLE = {
  info: { icon: Info, surface: "bg-info-surface", text: "text-info-text", label: "Info" },
  warning: { icon: AlertTriangle, surface: "bg-warning-surface", text: "text-warning-text", label: "Warning" },
  success: { icon: CheckCircle2, surface: "bg-success-surface", text: "text-success-text", label: "Success" },
} as const

export function CalloutView({ node, updateAttributes, selected }: NodeViewProps) {
  const variant = (node.attrs.variant as keyof typeof CALLOUT_STYLE) in CALLOUT_STYLE ? (node.attrs.variant as keyof typeof CALLOUT_STYLE) : "info"
  const style = CALLOUT_STYLE[variant]
  const Icon = style.icon
  return (
    <NodeViewWrapper className={cn("my-4 flex gap-3 rounded-lg p-4", style.surface, selected && "ring-2 ring-ring")} data-block="callout">
      <Icon className={cn("mt-0.5 size-4 shrink-0", style.text)} aria-hidden />
      <div className="min-w-0 flex-1">
        <div contentEditable={false} className="mb-1 flex select-none items-center gap-1">
          {(Object.keys(CALLOUT_STYLE) as Array<keyof typeof CALLOUT_STYLE>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => updateAttributes({ variant: key })}
              aria-pressed={key === variant}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                key === variant ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {CALLOUT_STYLE[key].label}
            </button>
          ))}
        </div>
        <NodeViewContent className="text-[15px] leading-6 text-foreground [&_p]:m-0" />
      </div>
    </NodeViewWrapper>
  )
}

export function KeyTakeawaysView({ selected }: NodeViewProps) {
  return (
    <NodeViewWrapper className={cn("my-4 rounded-lg border border-border bg-muted/50 p-4", selected && "ring-2 ring-ring")} data-block="keyTakeaways">
      <Label>Key takeaways</Label>
      <NodeViewContent className="mt-1 text-[15px] leading-6 text-foreground" />
    </NodeViewWrapper>
  )
}

export function DefinitionView({ node, updateAttributes, selected }: NodeViewProps) {
  return (
    <NodeViewWrapper className={frame(selected)} data-block="definition">
      <Label>Definition</Label>
      <div contentEditable={false} className="mt-1">
        <input
          type="text"
          aria-label="Term"
          className="w-full bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Term being defined"
          value={String(node.attrs.term ?? "")}
          onChange={(event) => updateAttributes({ term: event.target.value })}
        />
      </div>
      <NodeViewContent className="text-[15px] leading-6 text-foreground [&_p]:m-0" />
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// FAQ, steps, sources
// ---------------------------------------------------------------------------------------------------------------

export function FaqView(props: NodeViewProps) {
  return (
    <NodeViewWrapper className={frame(props.selected)} data-block="faq">
      <Label>FAQ · emits FAQPage</Label>
      <NodeViewContent className="mt-2 [&>div]:grid [&>div]:gap-3" />
      <button
        type="button"
        contentEditable={false}
        onClick={() => appendChild(props, { type: "faqItem", attrs: { question: "" }, content: [{ type: "paragraph" }] })}
        className="mt-3 inline-flex select-none items-center gap-1 text-sm font-medium text-primary-text hover:underline"
      >
        <Plus className="size-3.5" aria-hidden />
        Add question
      </button>
    </NodeViewWrapper>
  )
}

export function FaqItemView(props: NodeViewProps) {
  const { node, updateAttributes } = props
  return (
    <NodeViewWrapper className="group relative rounded-md border border-border bg-background p-3" data-block="faqItem">
      <div contentEditable={false} className="flex items-center gap-2">
        <input
          type="text"
          aria-label="Question"
          className="w-full bg-transparent text-[15px] font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Question"
          value={String(node.attrs.question ?? "")}
          onChange={(event) => updateAttributes({ question: event.target.value })}
        />
        <button
          type="button"
          aria-label="Remove question"
          onClick={() => removeItem(props)}
          className="rounded-md p-1 text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
      <NodeViewContent className="mt-1 text-[15px] leading-6 text-foreground [&_p]:m-0" />
    </NodeViewWrapper>
  )
}

export function StepsView(props: NodeViewProps) {
  return (
    <NodeViewWrapper className={frame(props.selected)} data-block="steps">
      <Label>Steps · emits HowTo</Label>
      <NodeViewContent className="mt-2 [counter-reset:step] [&>div]:grid [&>div]:gap-3" />
      <button
        type="button"
        contentEditable={false}
        onClick={() => appendChild(props, { type: "step", attrs: { name: "" }, content: [{ type: "paragraph" }] })}
        className="mt-3 inline-flex select-none items-center gap-1 text-sm font-medium text-primary-text hover:underline"
      >
        <Plus className="size-3.5" aria-hidden />
        Add step
      </button>
    </NodeViewWrapper>
  )
}

export function StepView(props: NodeViewProps) {
  const { node, updateAttributes } = props
  return (
    <NodeViewWrapper
      className="group relative rounded-md border border-border bg-background p-3 pl-12 [counter-increment:step] before:absolute before:left-3 before:top-3 before:flex before:size-6 before:items-center before:justify-center before:rounded-full before:bg-primary before:text-xs before:font-semibold before:text-primary-foreground before:content-[counter(step)]"
      data-block="step"
    >
      <div contentEditable={false} className="flex items-center gap-2">
        <input
          type="text"
          aria-label="Step name"
          className="w-full bg-transparent text-[15px] font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Step name"
          value={String(node.attrs.name ?? "")}
          onChange={(event) => updateAttributes({ name: event.target.value })}
        />
        <button
          type="button"
          aria-label="Remove step"
          onClick={() => removeItem(props)}
          className="rounded-md p-1 text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
      <NodeViewContent className="mt-1 text-[15px] leading-6 text-foreground [&_p]:m-0" />
    </NodeViewWrapper>
  )
}

export function SourcesView(props: NodeViewProps) {
  return (
    <NodeViewWrapper className={frame(props.selected)} data-block="sources">
      <Label>Sources</Label>
      <NodeViewContent className="mt-2 [&>div]:grid [&>div]:gap-3" />
      <button
        type="button"
        contentEditable={false}
        onClick={() => appendChild(props, { type: "sourceItem", attrs: { title: "", url: "" } })}
        className="mt-3 inline-flex select-none items-center gap-1 text-sm font-medium text-primary-text hover:underline"
      >
        <Plus className="size-3.5" aria-hidden />
        Add source
      </button>
    </NodeViewWrapper>
  )
}

export function SourceItemView(props: NodeViewProps) {
  const { node, updateAttributes } = props
  const url = String(node.attrs.url ?? "")
  return (
    <NodeViewWrapper className="group grid grid-cols-[1fr_1fr_160px_auto] items-end gap-2" data-block="sourceItem" contentEditable={false}>
      <Text label="Title" value={node.attrs.title} onChange={(title) => updateAttributes({ title })} placeholder="Report or page title" />
      <Text label="Link" value={url} onChange={(next) => updateAttributes({ url: next })} placeholder="https://" />
      <Text label="Publisher" value={node.attrs.publisher} onChange={(publisher) => updateAttributes({ publisher })} placeholder="Optional" />
      <button
        type="button"
        aria-label="Remove source"
        onClick={() => removeItem(props)}
        className="mb-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------------------------------------------

const CTA_VARIANTS = [
  { value: "open-account", label: "Open an account" },
  { value: "download-app", label: "Download the app" },
  { value: "book-call", label: "Book a call" },
  { value: "custom", label: "Custom" },
] as const

export function CtaView({ node, updateAttributes, selected }: NodeViewProps) {
  const variant = String(node.attrs.variant ?? "open-account")
  return (
    <NodeViewWrapper className={frame(selected)} data-block="cta" contentEditable={false}>
      <Label>Call to action</Label>
      <div className="mt-2 grid gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CTA_VARIANTS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={variant === option.value}
              onClick={() => updateAttributes({ variant: option.value })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                variant === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Text label="Heading" value={node.attrs.heading} onChange={(heading) => updateAttributes({ heading })} placeholder="Optional, uses the default for the type" />
        <Text label="Text" value={node.attrs.body} onChange={(body) => updateAttributes({ body })} placeholder="Optional" />
        {variant === "custom" ? (
          <div className="grid grid-cols-2 gap-2">
            <Text label="Button label" value={node.attrs.label} onChange={(label) => updateAttributes({ label })} />
            <Text label="Button link" value={node.attrs.href} onChange={(href) => updateAttributes({ href })} placeholder="/business" />
          </div>
        ) : null}
      </div>
    </NodeViewWrapper>
  )
}

export function ProductCardView({ node, updateAttributes, selected }: NodeViewProps) {
  const slug = String(node.attrs.product ?? "business") as ProductSlug
  const page = PRODUCT_PAGES[slug]
  return (
    <NodeViewWrapper className={frame(selected)} data-block="productCard" contentEditable={false}>
      <Label>Product card</Label>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{page?.label ?? "Choose a product"}</p>
          <p className="font-mono text-xs text-muted-foreground">{page?.path}</p>
        </div>
        <EditorSelect
          ariaLabel="Product page"
          className="w-52"
          value={slug}
          onValueChange={(product) => updateAttributes({ product })}
          options={(Object.keys(PRODUCT_PAGES) as ProductSlug[]).map((key) => ({ value: key, label: PRODUCT_PAGES[key].label }))}
        />
      </div>
    </NodeViewWrapper>
  )
}

/**
 * What a reader sees: a poster with a play button. The player (and any cookies) loads only when you click play, the
 * same click-to-load behaviour as the published page, so writing a post never starts third-party tracking.
 */
function EmbedPreview({ info, url, title }: { info: EmbedInfo | null; url: string; title: string }) {
  const [playing, setPlaying] = useState(false)
  const player = embedPlayerSrc(info)
  const poster = embedPosterSrc(info)

  if (!url) {
    return <div className="flex aspect-video items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">Paste a link above</div>
  }
  if (!info) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-md bg-muted px-6 text-center text-sm text-muted-foreground">
        This address can’t be embedded. Use a link instead.
      </div>
    )
  }
  if (!player) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-video items-center justify-center gap-1.5 rounded-md bg-muted text-sm text-muted-foreground hover:text-foreground"
      >
        <ExternalLink className="size-4" aria-hidden />
        {PROVIDER_LABEL[info.provider]} opens in the reader’s browser. Open it to check.
      </a>
    )
  }
  if (playing) {
    return (
      <iframe
        src={player}
        title={title || `${PROVIDER_LABEL[info.provider]} video`}
        className="aspect-video w-full rounded-md border-0 bg-muted"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    )
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title || PROVIDER_LABEL[info.provider]}`}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md bg-muted"
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster for a third-party video; sized by its container
        <img src={poster} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
      ) : null}
      <span className="absolute inset-0 bg-foreground/10 transition-colors group-hover:bg-foreground/20" aria-hidden />
      <span className="relative flex size-14 items-center justify-center rounded-full bg-background/95 text-foreground shadow-card">
        <Play className="size-6 translate-x-0.5" aria-hidden />
      </span>
      <span className="absolute bottom-2 left-3 rounded bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
        {PROVIDER_LABEL[info.provider]} · click to play
      </span>
    </button>
  )
}

export function EmbedView({ node, updateAttributes, selected }: NodeViewProps) {
  const url = String(node.attrs.url ?? "")
  const provider = (node.attrs.provider as keyof typeof PROVIDER_LABEL) ?? "other"
  const detected = url ? detectEmbed(url) : null
  return (
    <NodeViewWrapper className={frame(selected)} data-block="embed" contentEditable={false}>
      <Label>Embed · {PROVIDER_LABEL[provider] ?? "Embed"}</Label>
      <div className="mt-2 grid gap-3">
        <Field label="Link">
          <input
            type="text"
            className={fieldClass}
            value={url}
            placeholder="Paste a YouTube, Vimeo, Loom or X link"
            onChange={(event) => {
              const next = event.target.value
              updateAttributes({ url: next, provider: detectEmbed(next)?.provider ?? "other" })
            }}
          />
        </Field>
        <Text label="Title" value={node.attrs.title} onChange={(title) => updateAttributes({ title })} placeholder="Describes the embed for readers using a screen reader" />
        <EmbedPreview key={url} info={detected} url={url} title={String(node.attrs.title ?? "")} />
      </div>
    </NodeViewWrapper>
  )
}

export function ButtonBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  return (
    <NodeViewWrapper className={frame(selected)} data-block="button" contentEditable={false}>
      <Label>Button</Label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Text label="Label" value={node.attrs.label} onChange={(label) => updateAttributes({ label })} />
        <Text label="Link" value={node.attrs.href} onChange={(href) => updateAttributes({ href })} placeholder="/business" />
      </div>
      <p className="mt-3 inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        {String(node.attrs.label || "Button")}
      </p>
    </NodeViewWrapper>
  )
}

const IMAGE_WIDTHS = [
  { value: "column", label: "Column" },
  { value: "wide", label: "Wide" },
  { value: "full", label: "Full" },
] as const

export function ImageView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const width = String(node.attrs.width ?? "column")
  const alt = String(node.attrs.alt ?? "")
  const src = String(node.attrs.src ?? "")
  return (
    <NodeViewWrapper className="group relative my-5" data-block="image" contentEditable={false}>
      {/* Only the picture breaks out of the column. Wide and full are measured against the canvas (the editor's
          container), so they never run past its edges; the caption and controls stay in the column. */}
      <figure
        className={cn("overflow-hidden rounded-lg border border-border bg-muted", selected && "ring-2 ring-ring")}
        style={
          width === "wide"
            ? { marginInline: "calc((100% - min(960px, 100cqw - 48px)) / 2)" }
            : width === "full"
              ? { marginInline: "calc((100% - (100cqw - 48px)) / 2)" }
              : undefined
        }
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- editor preview of a Storage URL; width and height are unknown here.
          <img src={src} alt={alt} className="block h-auto w-full" draggable={false} />
        ) : (
          <div className="flex aspect-video items-center justify-center text-muted-foreground">
            <ImageOff className="size-6" aria-hidden />
          </div>
        )}
      </figure>
      <div className="mt-2 grid gap-2">
        <input
          type="text"
          aria-label="Caption"
          className="w-full bg-transparent text-center text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Add a caption"
          value={String(node.attrs.caption ?? "")}
          onChange={(event) => updateAttributes({ caption: event.target.value })}
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            aria-label="Alt text"
            className={cn(fieldClass, !alt.trim() && "border-warning")}
            placeholder="Alt text: describe the image for readers who can’t see it"
            value={alt}
            onChange={(event) => updateAttributes({ alt: event.target.value })}
          />
          <div role="group" aria-label="Image width" className="flex shrink-0 rounded-md border border-border p-0.5">
            {IMAGE_WIDTHS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={width === option.value}
                onClick={() => updateAttributes({ width: option.value })}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium",
                  width === option.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Remove image"
            onClick={() => deleteNode()}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
