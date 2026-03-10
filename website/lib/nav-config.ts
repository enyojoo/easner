import type { LucideIcon } from "lucide-react"
import {
  Building2,
  FileText,
  Wallet,
  CreditCard,
  Landmark,
  ReceiptText,
  Coins,
  Code,
  ShoppingCart,
  Briefcase,
  HardHat,
  User,
  Heart,
  Package,
} from "lucide-react"

export interface NavLink {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavSection {
  label: string
  items: NavLink[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Company",
    items: [
      { label: "About", href: "/about", icon: Building2 },
      { label: "Blog", href: "/blog", icon: FileText },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Personal Banking", href: "/personal-banking", icon: Wallet },
      { label: "Cards", href: "/cards", icon: CreditCard },
      { label: "Business Banking", href: "/business-banking", icon: Landmark },
      { label: "Invoicing", href: "/invoicing", icon: ReceiptText },
      { label: "Stablecoin Payments", href: "/stablecoin", icon: Coins },
      { label: "APIs", href: "/apis", icon: Code },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "E-commerce", href: "/ecommerce", icon: ShoppingCart },
      { label: "Agencies", href: "/agencies", icon: Briefcase },
      { label: "Contractors", href: "/contractors", icon: HardHat },
      { label: "Freelancers", href: "/freelancers", icon: User },
      { label: "Healthcare", href: "/healthcare", icon: Heart },
      { label: "Wholesalers", href: "/wholesalers", icon: Package },
    ],
  },
]
