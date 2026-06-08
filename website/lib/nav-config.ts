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

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Products",
    items: [
      { label: "Personal Banking", href: "/personal", icon: "wallet", description: "Mobile banking for global earners" },
      { label: "Business Banking", href: "/business", icon: "landmark", description: "Accounts, payouts, teams, reporting" },
      { label: "Invoicing", href: "/invoicing", icon: "receipt", description: "Bank or stablecoin pay-in options" },
      { label: "Cards", href: "/cards", icon: "card", description: "Spend controls built into Easner" },
    ],
  },
]

export const NAV_LINKS: NavLink[] = [
  { label: "Stablecoin", href: "/stablecoin", icon: "coins" },
  { label: "Partners", href: "/partners", icon: "briefcase" },
  { label: "Developers", href: "/developers", icon: "code" },
]
