import type { DocNode } from "@easner/blog-content"

const t = (text: string, marks?: Array<{ type: "bold" | "italic" | "underline" | "strike" | "code" } | { type: "link"; attrs: { href: string } }>) =>
  marks ? { type: "text" as const, text, marks } : { type: "text" as const, text }
const p = (...content: ReturnType<typeof t>[]) => ({ type: "paragraph" as const, content })

/** Every node and mark in @easner/blog-content, so the editor can be checked against all of them. */
export const EVERY_BLOCK_DOC: DocNode = {
  type: "doc",
  content: [
    { type: "summary", content: [p(t("Sending money to Nigeria costs less when the money moves as a stablecoin behind a banking-simple screen. Here is how it works, and what to check first."))] },
    { type: "heading", attrs: { level: 2 }, content: [t("Why corridors matter")] },
    p(
      t("Most cross-border payments pass through several banks. "),
      t("Each hop", [{ type: "bold" }]),
      t(" adds time, and a "),
      t("fee", [{ type: "italic" }]),
      t(" that is hard to see. Read about "),
      t("Easner Business Banking", [{ type: "link", attrs: { href: "/business" } }]),
      t(", or call "),
      t("it", [{ type: "strike" }, { type: "underline" }]),
      t(" with "),
      t("code", [{ type: "code" }]),
      t("."),
      { type: "hardBreak" as const },
      t("A paid placement", [{ type: "link", attrs: { href: "https://example.com/partner", sponsored: true } }]),
      t(" after a line break."),
    ),
    { type: "heading", attrs: { level: 3 }, content: [t("What changes for you")] },
    { type: "heading", attrs: { level: 4 }, content: [t("A small heading")] },
    { type: "bulletList", content: [{ type: "listItem", content: [p(t("Faster, typically minutes to hours"))] }, { type: "listItem", content: [p(t("Fees and FX are shown before you confirm"))] }] },
    { type: "orderedList", content: [{ type: "listItem", content: [p(t("Open an account"))] }, { type: "listItem", content: [p(t("Add the recipient"))] }] },
    { type: "taskList", content: [{ type: "taskItem", attrs: { checked: true }, content: [p(t("Verify your business"))] }, { type: "taskItem", attrs: { checked: false }, content: [p(t("Send a first payment"))] }] },
    { type: "blockquote", attrs: { attribution: "A customer" }, content: [p(t("It arrived the same afternoon."))] },
    { type: "codeBlock", attrs: { language: "bash" }, content: [t("curl https://api.easner.com/v1/ping")] },
    { type: "horizontalRule" },
    { type: "image", attrs: { src: "/dev/sample-image", alt: "A blue gradient sample cover", caption: "A sample figure", width: "column", widthPx: 1600, heightPx: 900 } },
    {
      type: "table",
      content: [
        { type: "tableRow", content: [{ type: "tableHeader", content: [p(t("Route"))] }, { type: "tableHeader", content: [p(t("Typical time"))] }] },
        { type: "tableRow", content: [{ type: "tableCell", content: [p(t("USD to NGN"))] }, { type: "tableCell", attrs: { align: "center" }, content: [p(t("Minutes to hours")), p(t("Same day where supported"))] }] },
        { type: "tableRow", content: [{ type: "tableCell", attrs: { colspan: 2 }, content: [p(t("A cell that spans both columns"))] }] },
      ],
    },
    { type: "callout", attrs: { variant: "info" }, content: [p(t("Availability depends on the corridor, where supported."))] },
    { type: "callout", attrs: { variant: "warning" }, content: [p(t("Check the recipient’s details before you confirm."))] },
    { type: "keyTakeaways", content: [{ type: "bulletList", content: [{ type: "listItem", content: [p(t("Stablecoin settlement runs behind the screens"))] }, { type: "listItem", content: [p(t("You see the fee before you confirm"))] }] }] },
    {
      type: "faq",
      content: [
        { type: "faqItem", attrs: { question: "How fast is it?" }, content: [p(t("Typically minutes to hours, same-day where supported."))] },
        { type: "faqItem", attrs: { question: "Is there a fee?" }, content: [p(t("Fees and FX may apply, shown before you confirm."))] },
      ],
    },
    {
      type: "steps",
      attrs: { name: "How to send money" },
      content: [
        { type: "step", attrs: { name: "Open the app" }, content: [p(t("Sign in to Easner Mobile."))] },
        { type: "step", attrs: { name: "Choose a recipient" }, content: [p(t("Pick someone or add a new recipient."))] },
      ],
    },
    { type: "definition", attrs: { term: "Stablecoin" }, content: [p(t("A digital currency designed to hold a steady value, such as USDC."))] },
    { type: "cta", attrs: { variant: "open-account", heading: "Open an Easner account", body: "Takes a few minutes once verified." } },
    { type: "productCard", attrs: { product: "business" } },
    { type: "embed", attrs: { provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "A walkthrough" } },
    { type: "button", attrs: { label: "See Business Banking", href: "/business" } },
    { type: "sources", content: [{ type: "sourceItem", attrs: { title: "World Bank remittance prices", url: "https://remittanceprices.worldbank.org", publisher: "World Bank" } }] },
  ],
}
