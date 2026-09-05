/** Canonical messaging – import for copy, FAQ, llms.txt, and JSON-LD. */

export const EASNER_CANONICAL_DEFINITION =
  "Easner is stablecoin-powered banking and payment infrastructure for global cross-border money movement – personal and business accounts, payouts, collections, cards, and partner APIs – connecting US, EU, and UK rails to supported local markets worldwide, with compliance built in."

export const EASNER_CANONICAL_DEFINITION_SHORT =
  "Stablecoin-powered banking infrastructure for cross-border money movement – accounts, payouts, collections, and cards, with compliance built in."

export const EASNER_ONE_LINE_THESIS =
  "Easner connects global and local financial rails – so businesses and individuals can collect, pay, and manage money across borders from one platform."

export const EASNER_UX_LINE =
  "Modern mobile and business banking – global reach, local payout depth, familiar screens."

export const EASNER_AUDIENCE_A =
  "People and businesses operating globally – multi-currency accounts, send and receive, and cards with developed-market banking clarity."

export const EASNER_AUDIENCE_B =
  "Companies paying across borders – pay suppliers, contractors, and teams in supported local markets from one ledger with KYC/KYB built in."

export const EASNER_PRODUCT_PERSONAL = "Easner Personal Banking"
export const EASNER_PRODUCT_BUSINESS = "Easner Business Banking"
export const EASNER_PRODUCT_PARTNERS = "Easner for Partners"

export const EASNER_SUPPORTED_LOCAL_MARKETS =
  "Nigeria, Mexico, Philippines, India, China, and more as we expand"

export const EASNER_CORRIDOR_VISUAL_ARIA_LABEL =
  "Supported corridor markets across the United States, Europe, United Kingdom, Nigeria, Mexico, Philippines, India, China, and more to come"

export const EASNER_CORRIDOR_COVERAGE_FAQ =
  "Easner connects US, EU, and UK rails to supported payout markets across Africa, the Middle East, Latin America, and Asia-Pacific – more than 80 countries today, including Nigeria, Mexico, Philippines, India, and China, with more corridors added regularly. Availability varies by jurisdiction, verification tier, and partner rules. See our KYC/KYB and AML Policy for eligibility details."

export const EASNER_SIGNUP_ELIGIBILITY_FAQ =
  "Easner accepts business and personal signups from most countries worldwide. A small number of jurisdictions are excluded for compliance and sanctions reasons – see our KYC/KYB and AML Policy for the current list."

/** Primary SEO keywords (hero/meta). */
export const EASNER_PRIMARY_KEYWORDS = [
  "global cross-border payments",
  "international business banking",
  "cross-border B2B payouts",
  "multi-currency business account",
  "stablecoin banking infrastructure",
  "pay suppliers internationally",
] as const

/** Supporting SEO keywords (body, FAQ, llms.txt). */
export const EASNER_SUPPORTING_KEYWORDS = [
  "emerging markets payments",
  "diaspora banking",
  "white-label remittance",
  "embedded payouts API",
  "send money to Nigeria",
  "send money to China",
  "send money to the Philippines",
  "send money to Mexico",
  "send money to India",
  "cross-border personal payments",
  "Africa payments infrastructure",
  "Latin America payments infrastructure",
  "Asia cross-border banking",
  "Europe cross-border banking",
  "US global business banking",
] as const

/**
 * Developed-market (Global North) geo keywords — disaggregates Easner's confirmed
 * US/EU/UK rails by country and major business hub for search granularity. Safe to use
 * broadly: these describe where customers/businesses operate FROM, already covered by
 * the canonical "US, EU, and UK rails" definition.
 */
export const EASNER_DEVELOPED_MARKET_KEYWORDS = [
  "cross-border banking USA",
  "business banking United States",
  "UK cross-border payments",
  "business banking United Kingdom",
  "Germany cross-border payments",
  "France cross-border banking",
  "Netherlands business banking",
  "Ireland cross-border payments",
  "Spain business banking",
  "Italy cross-border payments",
  "EU multi-currency business account",
  "New York cross-border banking",
  "London business banking",
  "California business banking",
  "Texas global payments",
] as const

/**
 * Emerging-market (Global South) geo keywords — targets major markets by cross-border
 * remittance and trade volume across Africa, MENA, Latin America, and Asia-Pacific.
 * Easner accepts signups and payouts broadly (see /compliance for hard-blocked
 * jurisdictions, not an allowlist), so these are safe SEO-only targeting terms – they
 * do not imply a dedicated localized product page for each country the way
 * EASNER_SUPPORTED_LOCAL_MARKETS (the featured, deepest-integrated local markets) does.
 * Use these for meta keywords / llms.txt / structured data only – do not add new country
 * names into visible hero, feature, or FAQ copy without separately confirming that
 * in-product localized experience.
 */
export const EASNER_EMERGING_MARKET_KEYWORDS = [
  // Africa
  "Lagos business banking",
  "Lagos cross-border payments",
  "Nairobi cross-border payments",
  "Ghana cross-border payments",
  "South Africa business banking",
  "Egypt cross-border payments",
  "Rwanda cross-border payments",
  "Uganda business banking",
  "Tanzania cross-border payments",
  "Senegal cross-border payments",
  "Zambia business banking",
  "West Africa payments infrastructure",
  "East Africa cross-border banking",
  // MENA
  "UAE cross-border payments",
  "Saudi Arabia business banking",
  "MENA cross-border payments",
  // Latin America
  "Mexico City supplier payments",
  "Brazil cross-border payments",
  "Colombia business banking",
  "Latin America supplier payments",
  // Asia-Pacific
  "Manila remittance app",
  "Mumbai business account",
  "Pakistan cross-border payments",
  "Bangladesh remittance app",
  "Vietnam supplier payments",
  "Indonesia cross-border payments",
  "Southeast Asia B2B payments",
  "South Asia remittance infrastructure",
] as const

/**
 * Cross-border trade and outsourcing intent keywords — targets businesses in developed
 * markets paying emerging-market suppliers, contractors, or offshore/nearshore teams
 * (including manufacturers in China), plus service businesses operating across borders.
 * High commercial intent; SEO-only, same visible-copy rule as EASNER_EMERGING_MARKET_KEYWORDS.
 */
export const EASNER_TRADE_AND_OUTSOURCING_KEYWORDS = [
  "pay suppliers in China",
  "pay Chinese manufacturers",
  "offshore outsourcing payments",
  "nearshore payroll Latin America",
  "pay overseas contractors",
  "international contractor payments",
  "global payroll for remote teams",
  "B2B cross-border trade payments",
  "pay import suppliers internationally",
  "cross-border payments for importers",
  "business account for exporters",
  "pay freelancers abroad",
  "international vendor payments platform",
  "cross-border payroll for agencies",
] as const
