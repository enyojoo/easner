import type { StaticImageData } from "next/image"
import type { FeatureDescriptionPart } from "./currency-assets"

export interface Cta {
  label: string
  href: string
  external?: boolean
  store?: "download" | "app-store" | "google-play"
  action?: "open-account"
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

export interface HeroContent {
  h1: string
  subhead: string
  visualSlot: string
  altText: string
  badge?: string
  ctas: Cta[]
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
  tierNote?: string
  statusBanner?: string
  commercialModels?: CardItem[]
  capabilities?: CardItem[]
  segments?: CardItem[]
  ctaBand: CtaBandContent
  faq?: FaqItem[]
  complianceNote?: string
}
