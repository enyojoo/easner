import type { StaticImageData } from "next/image"
import type { FeatureDescriptionPart } from "./currency-assets"

export interface Cta {
  label: string
  href: string
  external?: boolean
  store?: "download" | "app-store" | "google-play"
  action?: "open-account"
  /** PostHog cta_location; registers outbound attribution for app/business destinations. */
  analyticsLocation?: string
}

export interface Founder {
  name: string
  title: string
  tagline: string
  /** Full bio shown in the read-more dialog. */
  bio: string[]
  image: StaticImageData
  linkedin: string
  x?: string
}

export interface FaqItem {
  question: string
  answer: string
  links?: { label: string; href: string }[]
}

/** Visible, query-shaped answer used for AEO / AIO. Schema must quote this exact text. */
export interface AnswerFact {
  term: string
  definition: string
}

export interface HowToStep {
  name: string
  text: string
}

export interface AnswerDefinition {
  /** DefinedTerm name, e.g. "Easner Personal Banking". */
  term: string
  /** Question-shaped H2, e.g. "What is Easner Personal Banking?" */
  question: string
  /** 40–70 word answer; the first sentence must stand alone. */
  answer: string
  facts?: AnswerFact[]
  stepsHeadline?: string
  steps?: HowToStep[]
}

export interface Feature {
  title: string
  description: string
  descriptionParts?: FeatureDescriptionPart[]
  visualSlot?: string
  altText?: string
}

export interface CardItem {
  title: string
  description: string
  icon?: string
  link?: string
}

export interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
}

export interface HeroNote {
  lead: string
  linkLabel: string
  href: string
  trail: string
}

export interface HeroContent {
  h1: string
  subhead: string
  visualSlot: string
  altText: string
  badge?: string
  ctas: Cta[]
  /** Shown above download / web-app CTAs when present. */
  ctaDescription?: string
  /** One line under the subhead, with a single link. */
  note?: HeroNote
}

export interface ProblemContent {
  headline: string
  body: string
  stat?: string
}

export interface SolutionContent {
  headline: string
  body: string
  visualSlot: string
  altText: string
  bullets?: string[]
  reverse?: boolean
}

export interface CtaBandContent {
  headline: string
  subhead?: string
  ctas: Cta[]
}

export interface IntegrationStep {
  title: string
  description: string
}

export interface ProductPageContent {
  metadata: PageMetadata
  hero: HeroContent
  problem?: ProblemContent
  solution?: SolutionContent
  features?: Feature[]
  featuresLayout?: "alternating" | "bento"
  featuresHeadline?: string
  featuresSubhead?: string
  extraSections?: SolutionContent[]
  integrationSteps?: IntegrationStep[]
  integrationStepsHeadline?: string
  integrationStepsFootnote?: string
  tiers?: "personal" | "business"
  useCases?: CardItem[]
  useCasesHeadline?: string
  useCasesSubhead?: string
  /** Jobs that have their own page, shown as links under the use cases ("Run payroll →"). */
  useCaseLinks?: { label: string; href: string }[]
  tierNote?: string
  statusBanner?: string
  commercialModels?: CardItem[]
  capabilities?: CardItem[]
  segments?: CardItem[]
  ctaBand: CtaBandContent
  /** Always-visible definition used for answer engines and FAQ schema. */
  definition?: AnswerDefinition
  faq?: FaqItem[]
  complianceNote?: string
}
