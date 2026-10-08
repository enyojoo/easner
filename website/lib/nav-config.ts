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

export interface NavGroup {
  label: string
  items: NavLink[]
}

export interface NavSection {
  label: string
  /** Labelled columns in the menu. */
  groups: NavGroup[]
}

/** About – rendered before Products (the logo links home). */
export const NAV_LEADING_LINKS: NavLink[] = [{ label: "About", href: "/about", icon: "building" }]

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Products",
    groups: [
      {
        label: "Personal",
        items: [
          { label: "Personal Banking", href: "/personal", icon: "wallet", description: "Your money in USD, EUR and GBP" },
          { label: "Cards", href: "/cards", icon: "card", description: "Spend controls, when available" },
        ],
      },
      {
        label: "Business",
        items: [
          { label: "Business Banking", href: "/business", icon: "landmark", description: "Accounts, payouts and team access" },
          { label: "Checkout", href: "/checkout", icon: "cart", description: "Payments on your own website" },
          { label: "Payment Links", href: "/payment-links", icon: "link", description: "Get paid with a link" },
          { label: "Invoicing", href: "/invoicing", icon: "receipt", description: "Card, bank or stablecoin pay-in" },
          { label: "Payroll", href: "/payroll", icon: "users", description: "Pay your team, with approvals" },
        ],
      },
      {
        label: "Build",
        items: [
          { label: "Partners", href: "/partners", icon: "briefcase", description: "Payments under your brand" },
          { label: "Developers", href: "/developers", icon: "code", description: "APIs for accounts and payouts" },
          { label: "Stablecoin", href: "/stablecoin", icon: "coins", description: "USDC and EURC, where enabled" },
        ],
      },
    ],
  },
]

/** Mid nav links after Products */
export const NAV_LINKS: NavLink[] = []

/** Contact – rendered last */
export const NAV_TRAILING_LINKS: NavLink[] = [{ label: "Contact", href: "/contact", icon: "user" }]
