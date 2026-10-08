/**
 * One fictional world for every product screen on the website, taken from the design-system cards
 * (BizHome, AppHome, AppSend, AppSendReview, AppMore, WebPartnerShowcase) so names and amounts agree
 * across pages. All people, businesses and numbers are illustrative.
 */
import type { StatusKey } from "@/components/ds/status-badge"

export interface DemoActivity {
  date: string
  name: string
  detail: string
  method: string
  status: StatusKey
  /** Positive is money in. */
  amount: number
}

export const DEMO_BUSINESS = {
  name: "Northwind Trading Ltd",
  totalBalance: 37755.32,
  moneyIn: 18240.5,
  moneyOut: -9812.2,
  activity: [
    {
      date: "Sep 26",
      name: "Acme Logistics",
      detail: "Invoice INV-0142",
      method: "Bank transfer",
      status: "completed",
      amount: 12480,
    },
    {
      date: "Sep 26",
      name: "Kwame Mensah",
      detail: "GCB • 0123 4567 89",
      method: "Local transfer",
      status: "processing",
      amount: -452.5,
    },
    {
      date: "Sep 26",
      name: "Payroll – September",
      detail: "18 people",
      method: "Payroll",
      status: "processing",
      amount: -48210.55,
    },
    {
      date: "Sep 25",
      name: "Stripe payout",
      detail: "Online payments",
      method: "Card payments",
      status: "completed",
      amount: 3120.4,
    },
    {
      date: "Sep 25",
      name: "Lagos office rent",
      detail: "GTBank • 0123 4567 89",
      method: "Local transfer",
      status: "completed",
      amount: -3678.96,
    },
  ] satisfies DemoActivity[],
}

export interface DemoTransaction {
  name: string
  time: string
  amount: number
  status: StatusKey
}

export const DEMO_PERSONAL = {
  name: "Ada Obi",
  initials: "AO",
  easetag: "@adaobi",
  balances: [
    { currency: "USD", label: "USD Balance", amount: 24190.32 },
    { currency: "EUR", label: "EUR Balance", amount: 4870.22 },
    { currency: "GBP", label: "GBP Balance", amount: 1110 },
  ],
  transactions: [
    { name: "Northwind salary", time: "9:14 AM", amount: 6200, status: "completed" },
    { name: "Kwame Mensah", time: "8:02 AM", amount: -450, status: "processing" },
  ] satisfies DemoTransaction[],
}

export const DEMO_SEND = {
  recipient: { name: "Kwame Mensah", detail: "GCB • 0123 4567 89", country: "GH" },
  receiveAmount: 5512,
  receiveCurrency: "GHS",
  sendAmount: 450,
  fee: 2.5,
  rate: 12.25,
  method: "Local transfer",
  arrival: "Within minutes",
  note: "School fees",
}

export const DEMO_RECIPIENTS = [
  { name: "Kwame Mensah", detail: "GCB • 0123 4567 89", country: "GH" },
  { name: "Amara Okafor", detail: "Personal • @amara", initials: "AO" },
  { name: "Chidi Eze", detail: "GTBank • 0123 4567 89", country: "NG" },
  { name: "Acme Supplies", detail: "Business • @acme", initials: "AS" },
  { name: "Wanjiru Kamau", detail: "M-Pesa • +254 712 345 678", country: "KE" },
] as const

/** Partner brand for the Easner for Partners illustration: demo data, not a design token. */
export const DEMO_PARTNER = {
  name: "Harbor Remit",
  initial: "H",
  color: "#0F5F5C",
  colorEnd: "#13807B",
  tint: "rgba(15, 95, 92, 0.1)",
  tintSubtle: "rgba(15, 95, 92, 0.06)",
  balance: 1840,
  supportEmail: "help@harborremit.com",
  transactions: [
    { name: "Ama Owusu", time: "GCB Bank • 10:22 AM", amount: -300, status: "processing" },
    { name: "Chidi Okeke", time: "Mobile money • 8:40 AM", amount: -200, status: "completed" },
  ] satisfies DemoTransaction[],
}

/** Merchants on hosted pay pages (CheckoutHosted, BizPayPublic): demo data; each brings its own accent colour. */
export const DEMO_MERCHANTS = {
  lumen: { name: "Lumen Coffee Co.", initial: "L", color: "#7A4A2A", tint: "#F0EAE3" },
  brightpath: { name: "Brightpath Studio", initial: "B", color: "#0F6B6B", tint: "#E6EEEC" },
  northwind: { name: "Northwind Trading Ltd", initial: "N", color: "#007ACC", tint: "#E9EDEE" },
} as const

export type DemoMerchant = (typeof DEMO_MERCHANTS)[keyof typeof DEMO_MERCHANTS]

/** A second fictional partner for the faith and mission programme illustration. */
export const DEMO_FAITH_PARTNER = {
  name: "Grace Mission",
  initial: "G",
  color: "#8C2F39",
  colorEnd: "#B04452",
  tint: "rgba(140, 47, 57, 0.1)",
  tintSubtle: "rgba(140, 47, 57, 0.06)",
  balance: 18420.5,
  transactions: [
    { name: "Diaspora giving", time: "London • 11:05 AM", amount: 250, status: "completed" },
    { name: "Accra branch support", time: "GCB Bank • 9:30 AM", amount: -1200, status: "completed" },
  ] satisfies DemoTransaction[],
}
