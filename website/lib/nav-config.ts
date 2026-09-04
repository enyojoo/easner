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
  items: NavLink[]
}

/** Home, About – rendered before Products */
export const NAV_LEADING_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: "building" },
  { label: "About", href: "/about", icon: "building" },
]

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Products",
    items: [
      { label: "Personal Banking", href: "/personal", icon: "wallet", description: "Mobile banking for global earners" },
      { label: "Business Banking", href: "/business", icon: "landmark", description: "Accounts, payouts, teams, reporting" },
      { label: "Checkout", href: "/checkout", icon: "cart", description: "Embed checkout on your own website" },
      { label: "Payment Links", href: "/payment-links", icon: "link", description: "Get paid with a link – no website needed" },
      { label: "Whitelabel", href: "/partners", icon: "briefcase", description: "Branded cross-border and partner programs" },
      { label: "Payroll", href: "/payroll", icon: "users", description: "Cross-border payroll with approvals built in" },
      { label: "Invoicing", href: "/invoicing", icon: "receipt", description: "Bank or stablecoin pay-in options" },
      { label: "Stablecoin", href: "/stablecoin", icon: "coins", description: "Stablecoin speed with banking screens" },
      { label: "Cards", href: "/cards", icon: "card", description: "Spend controls, when available on your account" },
      { label: "Developers", href: "/developers", icon: "code", description: "Compliant rails in your product" },
    ],
  },
]

/** Mid nav links after Products */
export const NAV_LINKS: NavLink[] = []

/** Contact – rendered last */
export const NAV_TRAILING_LINKS: NavLink[] = [
  { label: "Contact", href: "/contact", icon: "user" },
]
