import { AiAnswers } from "@/components/marketing/ai-answers"
import { CtaBand } from "@/components/marketing/cta-band"
import { aiAllFaqs, aiGlossary, aiHowTos, aiMetadata } from "@/lib/marketing/content/ai"
import { homeCtaBand } from "@/lib/marketing/content/home"
import { marketingMetadata } from "@/lib/marketing/metadata"
import {
  answerEngineJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToJsonLd,
  jsonLdScript,
} from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({
  metadata: aiMetadata,
  path: "/answers",
  titleAbsolute: aiMetadata.title,
})

export default function AiAnswersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Answers", path: "/answers" },
          ]),
          faqPageJsonLd(aiAllFaqs),
          ...answerEngineJsonLd({
            name: aiMetadata.title,
            description: aiMetadata.description,
            path: "/answers",
            glossary: aiGlossary,
            speakable: true,
          }),
          ...aiHowTos.map((section) =>
            howToJsonLd({
              name: section.howTo.name,
              description: section.definition.answer,
              steps: section.howTo.steps,
            }),
          ),
        ])}
      />
      <AiAnswers />
      <CtaBand content={homeCtaBand} />
    </>
  )
}
