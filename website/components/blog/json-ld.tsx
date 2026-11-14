import { jsonLdScript } from "@/lib/marketing/structured-data"

/** One `<script type="application/ld+json">` with every node for the page. `<` is escaped by `jsonLdScript`. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(data)} />
}
