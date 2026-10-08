export type NavIconName =
  | "building"
  | "file"
  | "wallet"
  | "card"
  | "landmark"
  | "receipt"
  | "coins"
  | "code"
  | "briefcase"
  | "user"
  | "cart"
  | "users"
  | "link"

export interface NavLink {
  label: string
  href: string
  icon: NavIconName
  description?: string
}

export interface NavSection {
  label: string
  /** Who the menu is for, shown beside its products. */
  intro: { title: string; body: string; cta: { label: string; href: string } }
  items: NavLink[]
}

/** Home and About – rendered before the product menus. */
export const NAV_LEADING_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: "building" },
  { label: "About", href: "/about", icon: "building" },
]

/** Personal, Business and Build: one menu each. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Personal",
    intro: {
      title: "For your own money",
      body: "Hold USD and EUR, get paid, and send to 80+ countries from the Easner app.",
      cta: { label: "Download the app", href: "/app" },
    },
    items: [
      { label: "Personal Banking", href: "/personal", icon: "wallet", description: "Accounts in your name, sending and receiving" },
      { label: "Cards", href: "/cards", icon: "card", description: "Spend controls, when available" },
    ],
  },
  {
    label: "Business",
    intro: {
      title: "For your company",
      body: "Accounts, customer payments, payouts and payroll in one dashboard.",
      cta: { label: "Explore Business", href: "/business" },
    },
    items: [
      { label: "Business Banking", href: "/business", icon: "landmark", description: "Accounts, payouts and team access" },
      { label: "Checkout", href: "/checkout", icon: "cart", description: "Payments on your own website" },
      { label: "Payment Links", href: "/payment-links", icon: "link", description: "Get paid with a link" },
      { label: "Invoicing", href: "/invoicing", icon: "receipt", description: "Paid by card, bank or stablecoin" },
      { label: "Payroll", href: "/payroll", icon: "users", description: "Pay your team, with approvals" },
    ],
  },
  {
    label: "Build",
    intro: {
      title: "For platforms and partners",
      body: "Put Easner's accounts, payouts and stablecoin rails inside your product or under your brand.",
      cta: { label: "Talk to our team", href: "/contact" },
    },
    items: [
      { label: "Partners", href: "/partners", icon: "briefcase", description: "Payments under your brand" },
      { label: "Developers", href: "/developers", icon: "code", description: "APIs for accounts and payouts" },
      { label: "Stablecoin", href: "/stablecoin", icon: "coins", description: "Stablecoin payments, where enabled" },
    ],
  },
]

/** Mid nav links after Products */
export const NAV_LINKS: NavLink[] = []

/** Contact – rendered last */
export const NAV_TRAILING_LINKS: NavLink[] = [{ label: "Contact", href: "/contact", icon: "user" }]
