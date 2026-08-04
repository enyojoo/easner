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
      { label: "Cards", href: "/cards", icon: "card", description: "Spend controls built into Easner" },
      { label: "Invoicing", href: "/invoicing", icon: "receipt", description: "Bank or stablecoin pay-in options" },
      { label: "Stablecoin", href: "/stablecoin", icon: "coins", description: "Stablecoin speed with banking screens" },
      { label: "Whitelabel", href: "/partners", icon: "briefcase", description: "Branded remittance and OTC programs" },
    ],
  },
]

/** Mid nav links after Products */
export const NAV_LINKS: NavLink[] = [
  { label: "Developers", href: "/developers", icon: "code" },
]

/** Contact – rendered last */
export const NAV_TRAILING_LINKS: NavLink[] = [
  { label: "Contact", href: "/contact", icon: "user" },
]
