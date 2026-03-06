export interface Account {
  id: string
  currency: "USD" | "EUR" | "GBP" | "NGN"
  accountName: string
  bankName: string
  accountNumber: string
  fullAccountNumber: string
  routingNumber?: string // Only for USD
  sortCode?: string // Only for GBP
  iban?: string // Only for EUR
  bic?: string // Only for EUR
  bankAddress?: string // Bank address (e.g. for US accounts)
  balance: number
  availableBalance: number
  status: "active" | "pending" | "closed"
}

export interface Card {
  id: string
  type: "debit" | "credit"
  form: "virtual" | "physical"
  last4: string
  fullCardNumber: string
  cvv: string
  status: "active" | "inactive" | "blocked"
  expiryDate: string
  cardholderName: string
  balance: number
  billingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface Transaction {
  id: string
  type: "ach" | "wire" | "book" | "card"
  amount: number
  description: string
  date: string
  status: "completed" | "pending" | "processing" | "failed"
  direction: "credit" | "debit"
  cardId?: string
  category?: string
  fee?: number
  reference?: string
  /** For send/transfer transactions - links to status page */
  transferId?: string
  /** When linked to an invoice */
  invoiceId?: string
}

export const mockAccounts: Account[] = [
  {
    id: "acc_usd",
    currency: "USD",
    accountName: "Amazon, Inc",
    bankName: "Column Bank",
    accountNumber: "****1234",
    fullAccountNumber: "1234567891234",
    routingNumber: "121000248",
    bankAddress: "201 Spear Street, Suite 1100, San Francisco, CA 94105",
    balance: 12450.75,
    availableBalance: 12450.75,
    status: "active",
  },
  {
    id: "acc_eur",
    currency: "EUR",
    accountName: "Amazon, Inc",
    bankName: "Solaris Bank",
    accountNumber: "****3000",
    fullAccountNumber: "DE89370400440532013000",
    iban: "DE89370400440532013000",
    bic: "SOBKDEB2XXX",
    bankAddress: "Friedrichstraße 123, 10117 Berlin, Germany",
    balance: 8320.5,
    availableBalance: 8320.5,
    status: "active",
  },
  {
    id: "acc_gbp",
    currency: "GBP",
    accountName: "Amazon, Inc",
    bankName: "ClearBank",
    accountNumber: "****6819",
    fullAccountNumber: "31926819",
    sortCode: "04-00-04",
    bankAddress: "1 Bartholomew Lane, London EC2N 2AX, United Kingdom",
    balance: 5640.25,
    availableBalance: 5640.25,
    status: "active",
  },
  {
    id: "acc_ngn",
    currency: "NGN",
    accountName: "Amazon, Inc",
    bankName: "Providus Bank",
    accountNumber: "****3456",
    fullAccountNumber: "1234567893456",
    bankAddress: "1263 Adeola Odeku Street, Victoria Island, Lagos, Nigeria",
    balance: 2450000.0,
    availableBalance: 2450000.0,
    status: "active",
  },
]

export interface Beneficiary {
  id: string
  name: string
  bankName: string
  accountNumber: string
  fullAccountNumber: string
  routingNumber?: string
  iban?: string
  bic?: string
  sortCode?: string
  country: string
  currency: string
  email: string
  phone: string
  createdAt: string
  lastUsed: string
}

export const mockBeneficiaries: Beneficiary[] = [
  {
    id: "1",
    name: "John Doe",
    bankName: "Chase Bank",
    accountNumber: "1234567891234",
    fullAccountNumber: "1234567891234",
    routingNumber: "121000248",
    country: "United States",
    currency: "USD",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    createdAt: "2024-01-15",
    lastUsed: "2024-01-20",
  },
  {
    id: "2",
    name: "Maria Garcia",
    bankName: "Santander",
    accountNumber: "ES1234567890123456789012",
    fullAccountNumber: "ES1234567890123456789012",
    iban: "ES1234567890123456789012",
    bic: "BSCHESMMXXX",
    country: "Spain",
    currency: "EUR",
    email: "maria.garcia@email.com",
    phone: "+34 612 345 678",
    createdAt: "2024-01-10",
    lastUsed: "2024-01-18",
  },
  {
    id: "3",
    name: "David Smith",
    bankName: "Barclays",
    accountNumber: "12345678",
    fullAccountNumber: "12345678",
    sortCode: "20-00-00",
    country: "United Kingdom",
    currency: "GBP",
    email: "david.smith@email.com",
    phone: "+44 7700 900123",
    createdAt: "2024-01-05",
    lastUsed: "2024-01-12",
  },
  {
    id: "4",
    name: "Aisha Okafor",
    bankName: "Access Bank",
    accountNumber: "1234567893456",
    fullAccountNumber: "1234567893456",
    country: "Nigeria",
    currency: "NGN",
    email: "aisha.okafor@email.com",
    phone: "+234 801 234 5678",
    createdAt: "2024-01-08",
    lastUsed: "2024-01-15",
  },
]

export interface StablecoinAccount {
  currency: "USD" | "EUR"
  stablecoin: "USDC" | "EURC"
  chain: string
  address: string
  memo: string
}

export const mockStablecoinAccounts: StablecoinAccount[] = [
  {
    currency: "USD",
    stablecoin: "USDC",
    chain: "Solana",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    memo: "DEP-USD-1234",
  },
  {
    currency: "EUR",
    stablecoin: "EURC",
    chain: "Ethereum",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    memo: "DEP-EUR-3000",
  },
]

export interface PendingItem {
  id: string
  type: "approval" | "failed" | "action_required"
  title: string
  description: string
  amount?: number
  currency?: string
  createdAt: string
  href?: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoicePaymentInfo {
  paidAt: string
  method: "easner" | "cash"
  transactionId?: string
  cashNote?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  /** Customer id for linking to Customer record. When absent, matched by customerEmail. */
  customerId?: string
  customerName: string
  customerEmail: string
  /** Sum of line items (before tax). When absent, derived from lineItems. */
  subtotal?: number
  /** Tax rate as percentage (0–100), e.g. 10 for 10%. When absent, treated as 0. */
  taxRate?: number
  /** Tax amount. When absent, derived from subtotal × (taxRate / 100). */
  tax?: number
  total: number
  currency: string
  status: "draft" | "open" | "sent" | "past_due" | "paid" | "void" | "uncollectible" | "failed"
  dueDate: string
  createdDate: string
  finalizedDate: string | null
  frequency: string | null
  lineItems: InvoiceLineItem[]
  /** "individual" = bill to person; "company" = bill to company with Attn */
  billToType?: "individual" | "company"
  customerAddress?: string
  customerPhone?: string
  /** Company name when billToType === "company" */
  customerCompany?: string
  /** Notes added by business owner */
  notes?: { id: string; text: string; createdAt: string }[]
  /** Status change history - each change creates a new activity entry */
  statusHistory?: { status: string; timestamp: string }[]
  /** When true, invoice is hidden from main list (archived) */
  archived?: boolean
  /** Note to customer (e.g. payment terms, thank you message) */
  memo?: string
  /** Payment details when status is paid */
  paymentInfo?: InvoicePaymentInfo
}

export interface StablecoinDeposit {
  id: string
  amount: number
  currency: "USD" | "EUR"
  stablecoin: "USDC" | "EURC"
  chain: string
  date: string
  senderAddress?: string
  memo?: string
  reference?: string
}

export const mockStablecoinDeposits: StablecoinDeposit[] = [
  { id: "ETID000201", amount: 1500, currency: "USD", stablecoin: "USDC", chain: "Solana", date: "2025-01-10", memo: "EINV-0010", reference: "EINV-0010" },
  { id: "ETID000202", amount: 2500, currency: "USD", stablecoin: "USDC", chain: "Solana", date: "2025-01-08", memo: "Invoice payment" },
  { id: "ETID000203", amount: 500, currency: "EUR", stablecoin: "EURC", chain: "Ethereum", date: "2025-01-05", memo: "DEP-EUR-3000" },
  { id: "ETID000204", amount: 1200, currency: "USD", stablecoin: "USDC", chain: "Solana", date: "2025-01-12", memo: "EINV-0009" },
  { id: "ETID000205", amount: 3200, currency: "USD", stablecoin: "USDC", chain: "Ethereum", date: "2025-01-03", memo: "Freelance payment" },
  { id: "ETID000206", amount: 800, currency: "EUR", stablecoin: "EURC", chain: "Ethereum", date: "2025-01-01", memo: "DEP-EUR-3000" },
]

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  totalInvoices: number
  totalPaid: number
  currency: string
  status: "active" | "inactive"
  lastInvoiceDate: string
}

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Rosalyn Ward",
    email: "rosward1990@gmail.com",
    phone: "+1 (555) 123-4567",
    company: "Ward Enterprises",
    address: "123 Main St, New York, NY 10001",
    totalInvoices: 5,
    totalPaid: 2500.0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-12-10",
  },
  {
    id: "2",
    name: "Wilson Dagah",
    email: "admin@thekingsrubies.org",
    phone: "+1 (555) 987-6543",
    company: "The Kings Rubies",
    address: "456 Business Ave, Los Angeles, CA 90210",
    totalInvoices: 12,
    totalPaid: 8500.0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-12-10",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 456-7890",
    company: "TechCorp Solutions",
    address: "789 Tech Blvd, San Francisco, CA 94105",
    totalInvoices: 3,
    totalPaid: 1200.0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-11-28",
  },
  {
    id: "4",
    name: "Michael Chen",
    email: "m.chen@startup.io",
    phone: "+1 (555) 321-0987",
    company: "StartupIO",
    address: "321 Innovation Dr, Austin, TX 78701",
    totalInvoices: 8,
    totalPaid: 4200.0,
    currency: "USD",
    status: "inactive",
    lastInvoiceDate: "2024-10-15",
  },
  {
    id: "5",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@gmail.com",
    phone: "+1 (555) 234-5678",
    company: "",
    address: "100 Oak Lane, Denver, CO 80202",
    totalInvoices: 2,
    totalPaid: 450.0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-11-15",
  },
  {
    id: "6",
    name: "James Wilson",
    email: "j.wilson@outlook.com",
    phone: "+1 (555) 345-6789",
    company: "",
    address: "55 Pine St, Seattle, WA 98101",
    totalInvoices: 1,
    totalPaid: 0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-10-20",
  },
  {
    id: "7",
    name: "Lisa Park",
    email: "lisa.park@yahoo.com",
    phone: "+1 (555) 456-7890",
    company: "",
    address: "200 Elm Ave, Portland, OR 97201",
    totalInvoices: 0,
    totalPaid: 0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "",
  },
  {
    id: "8",
    name: "David Kim",
    email: "david.kim@nexus.io",
    phone: "+1 (555) 567-8901",
    company: "Nexus Digital",
    address: "88 Innovation Way, Boston, MA 02108",
    totalInvoices: 4,
    totalPaid: 3200.0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2025-01-15",
  },
  {
    id: "9",
    name: "Priya Sharma",
    email: "priya@globaltech.co",
    phone: "+1 (555) 678-9012",
    company: "GlobalTech Inc",
    address: "500 Commerce St, Chicago, IL 60601",
    totalInvoices: 6,
    totalPaid: 18500.0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2025-02-01",
  },
  {
    id: "10",
    name: "Alex Turner",
    email: "alex.turner@gmail.com",
    phone: "+1 (555) 789-0123",
    company: "",
    address: "22 Maple Dr, Nashville, TN 37201",
    totalInvoices: 3,
    totalPaid: 890.0,
    currency: "USD",
    status: "active",
    lastInvoiceDate: "2024-12-20",
  },
]

export const mockInvoices: Invoice[] = [
  {
    id: "EINV000001",
    invoiceNumber: "EINV-0001",
    customerId: "1",
    customerName: "Rosalyn Ward",
    customerEmail: "rosward1990@gmail.com",
    total: 500.0,
    currency: "USD",
    status: "void",
    dueDate: "2024-12-15",
    createdDate: "2024-12-10",
    finalizedDate: "2024-12-10",
    frequency: null,
    lineItems: [{ description: "Donation", quantity: 1, unitPrice: 500.0, amount: 500.0 }],
    billToType: "company",
    customerCompany: "Ward Enterprises",
    customerAddress: "123 Main St, New York, NY 10001",
    customerPhone: "+1 (555) 123-4567",
  },
  {
    id: "EINV000002",
    invoiceNumber: "EINV-0002",
    customerId: "2",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 500.0,
    currency: "USD",
    status: "void",
    dueDate: "2024-12-15",
    createdDate: "2024-12-10",
    finalizedDate: "2024-12-10",
    frequency: null,
    lineItems: [{ description: "Service Fee", quantity: 1, unitPrice: 500.0, amount: 500.0 }],
    billToType: "company",
    customerCompany: "The Kings Rubies",
    customerAddress: "456 Business Ave, Los Angeles, CA 90210",
    customerPhone: "+1 (555) 987-6543",
  },
  {
    id: "EINV000003",
    invoiceNumber: "EINV-0003",
    customerId: "2",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 1000.0,
    currency: "USD",
    status: "failed",
    dueDate: "2024-05-30",
    createdDate: "2024-05-23",
    finalizedDate: "2024-05-23",
    frequency: null,
    lineItems: [{ description: "Consulting Services", quantity: 10, unitPrice: 100.0, amount: 1000.0 }],
    billToType: "company",
    customerCompany: "The Kings Rubies",
    customerAddress: "456 Business Ave, Los Angeles, CA 90210",
    customerPhone: "+1 (555) 987-6543",
  },
  {
    id: "EINV000004",
    invoiceNumber: "EINV-DRAFT",
    customerId: "1",
    customerName: "Rosalyn Ward",
    customerEmail: "rosward1990@gmail.com",
    total: 0.0,
    currency: "USD",
    status: "draft",
    dueDate: "2024-05-30",
    createdDate: "2024-05-23",
    finalizedDate: null,
    frequency: null,
    lineItems: [],
    billToType: "company",
    customerCompany: "Ward Enterprises",
    customerAddress: "123 Main St, New York, NY 10001",
    customerPhone: "+1 (555) 123-4567",
  },
  {
    id: "EINV000005",
    invoiceNumber: "EINV-0005",
    customerId: "2",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 5.46,
    currency: "USD",
    status: "void",
    dueDate: "2023-02-08",
    createdDate: "2023-01-08",
    finalizedDate: "2023-01-08",
    frequency: "monthly",
    lineItems: [{ description: "Subscription", quantity: 1, unitPrice: 5.46, amount: 5.46 }],
    billToType: "company",
    customerCompany: "The Kings Rubies",
    customerAddress: "456 Business Ave, Los Angeles, CA 90210",
    customerPhone: "+1 (555) 987-6543",
  },
  {
    id: "EINV000006",
    invoiceNumber: "EINV-0006",
    customerId: "2",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 5.46,
    currency: "USD",
    status: "void",
    dueDate: "2023-01-08",
    createdDate: "2023-01-08",
    finalizedDate: "2023-01-08",
    frequency: "monthly",
    lineItems: [{ description: "Subscription", quantity: 1, unitPrice: 5.46, amount: 5.46 }],
    billToType: "company",
    customerCompany: "The Kings Rubies",
    customerAddress: "456 Business Ave, Los Angeles, CA 90210",
    customerPhone: "+1 (555) 987-6543",
  },
  {
    id: "EINV000007",
    invoiceNumber: "EINV-0007",
    customerId: "2",
    customerName: "Wilson Dagah",
    customerEmail: "admin@thekingsrubies.org",
    total: 5.46,
    currency: "USD",
    status: "void",
    dueDate: "2023-01-08",
    createdDate: "2023-01-08",
    finalizedDate: "2023-01-08",
    frequency: "monthly",
    lineItems: [{ description: "Subscription", quantity: 1, unitPrice: 5.46, amount: 5.46 }],
    billToType: "company",
    customerCompany: "The Kings Rubies",
    customerAddress: "456 Business Ave, Los Angeles, CA 90210",
    customerPhone: "+1 (555) 987-6543",
  },
  {
    id: "EINV000008",
    invoiceNumber: "EINV-0008",
    customerId: "3",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@techcorp.com",
    subtotal: 2500.0,
    tax: 0,
    total: 2500.0,
    currency: "USD",
    status: "paid",
    paymentInfo: { paidAt: "2025-01-09", method: "easner", transactionId: "ETID000202" },
    dueDate: "2025-04-15",
    createdDate: "2025-03-01",
    finalizedDate: "2025-03-01",
    frequency: null,
    lineItems: [{ description: "Software License", quantity: 1, unitPrice: 2500.0, amount: 2500.0 }],
    billToType: "company",
    customerCompany: "TechCorp Solutions",
    customerAddress: "789 Tech Blvd, San Francisco, CA 94105",
    customerPhone: "+1 (555) 456-7890",
  },
  {
    id: "EINV000009",
    invoiceNumber: "EINV-0009",
    customerId: "4",
    customerName: "Michael Chen",
    customerEmail: "m.chen@startup.io",
    subtotal: 1200.0,
    taxRate: 8,
    tax: 96.0,
    total: 1296.0,
    currency: "USD",
    status: "paid",
    paymentInfo: { paidAt: "2025-01-08", method: "cash", cashNote: "Received in person" },
    dueDate: "2025-02-01",
    createdDate: "2025-01-15",
    finalizedDate: "2025-01-15",
    frequency: null,
    lineItems: [{ description: "Consulting", quantity: 12, unitPrice: 100.0, amount: 1200.0 }],
    billToType: "company",
    customerCompany: "StartupIO",
    customerAddress: "321 Innovation Dr, Austin, TX 78701",
    customerPhone: "+1 (555) 321-0987",
  },
  {
    id: "EINV000010",
    invoiceNumber: "EINV-0010",
    customerId: "1",
    customerName: "Rosalyn Ward",
    customerEmail: "rosward1990@gmail.com",
    total: 1500.0,
    currency: "USD",
    status: "paid",
    paymentInfo: { paidAt: "2025-01-10", method: "easner", transactionId: "ETID000017" },
    dueDate: "2025-01-20",
    createdDate: "2025-01-10",
    finalizedDate: "2025-01-10",
    frequency: null,
    lineItems: [{ description: "Design Services", quantity: 1, unitPrice: 1500.0, amount: 1500.0 }],
    billToType: "company",
    customerCompany: "Ward Enterprises",
    customerAddress: "123 Main St, New York, NY 10001",
    customerPhone: "+1 (555) 123-4567",
  },
  {
    id: "EINV000011",
    invoiceNumber: "EINV-0011",
    customerId: "5",
    customerName: "Emma Rodriguez",
    customerEmail: "emma.rodriguez@gmail.com",
    total: 225.0,
    currency: "USD",
    status: "paid",
    paymentInfo: { paidAt: "2024-11-10", method: "cash", cashNote: "Check received" },
    dueDate: "2024-11-15",
    createdDate: "2024-11-01",
    finalizedDate: "2024-11-01",
    frequency: null,
    lineItems: [{ description: "Consulting", quantity: 3, unitPrice: 75.0, amount: 225.0 }],
    customerAddress: "100 Oak Lane, Denver, CO 80202",
    customerPhone: "+1 (555) 234-5678",
  },
  {
    id: "EINV000012",
    invoiceNumber: "EINV-0012",
    customerId: "5",
    customerName: "Emma Rodriguez",
    customerEmail: "emma.rodriguez@gmail.com",
    total: 225.0,
    currency: "USD",
    status: "paid",
    paymentInfo: { paidAt: "2024-11-15", method: "easner", transactionId: "ETID000201" },
    dueDate: "2024-11-25",
    createdDate: "2024-11-05",
    finalizedDate: "2024-11-05",
    frequency: null,
    lineItems: [{ description: "Follow-up Consulting", quantity: 3, unitPrice: 75.0, amount: 225.0 }],
    customerAddress: "100 Oak Lane, Denver, CO 80202",
    customerPhone: "+1 (555) 234-5678",
  },
  {
    id: "EINV000013",
    invoiceNumber: "EINV-0013",
    customerId: "6",
    customerName: "James Wilson",
    customerEmail: "j.wilson@outlook.com",
    total: 450.0,
    currency: "USD",
    status: "sent",
    dueDate: "2024-11-15",
    createdDate: "2024-10-20",
    finalizedDate: "2024-10-20",
    frequency: null,
    lineItems: [{ description: "Web Development", quantity: 1, unitPrice: 450.0, amount: 450.0 }],
    customerAddress: "55 Pine St, Seattle, WA 98101",
    customerPhone: "+1 (555) 345-6789",
  },
  {
    id: "EINV000014",
    invoiceNumber: "EINV-0014",
    customerId: "8",
    customerName: "David Kim",
    customerEmail: "david.kim@nexus.io",
    total: 1200.0,
    currency: "USD",
    status: "paid",
    paymentInfo: { paidAt: "2025-01-12", method: "easner", transactionId: "ETID000204" },
    dueDate: "2025-01-25",
    createdDate: "2025-01-15",
    finalizedDate: "2025-01-15",
    frequency: null,
    lineItems: [{ description: "API Integration", quantity: 1, unitPrice: 1200.0, amount: 1200.0 }],
    billToType: "company",
    customerCompany: "Nexus Digital",
    customerAddress: "88 Innovation Way, Boston, MA 02108",
    customerPhone: "+1 (555) 567-8901",
  },
  {
    id: "EINV000015",
    invoiceNumber: "EINV-0015",
    customerId: "9",
    customerName: "Priya Sharma",
    customerEmail: "priya@globaltech.co",
    subtotal: 5000.0,
    taxRate: 10,
    tax: 500.0,
    total: 5500.0,
    currency: "USD",
    status: "open",
    dueDate: "2025-04-01",
    createdDate: "2025-02-01",
    finalizedDate: "2025-02-01",
    frequency: null,
    lineItems: [{ description: "Enterprise Support", quantity: 1, unitPrice: 5000.0, amount: 5000.0 }],
    billToType: "company",
    customerCompany: "GlobalTech Inc",
    customerAddress: "500 Commerce St, Chicago, IL 60601",
    customerPhone: "+1 (555) 678-9012",
  },
  {
    id: "EINV000016",
    invoiceNumber: "EINV-0016",
    customerId: "10",
    customerName: "Alex Turner",
    customerEmail: "alex.turner@gmail.com",
    total: 350.0,
    currency: "USD",
    status: "paid",
    paymentInfo: { paidAt: "2024-12-18", method: "cash", cashNote: "Venmo" },
    dueDate: "2024-12-20",
    createdDate: "2024-12-10",
    finalizedDate: "2024-12-10",
    frequency: null,
    lineItems: [{ description: "Logo Design", quantity: 1, unitPrice: 350.0, amount: 350.0 }],
    customerAddress: "22 Maple Dr, Nashville, TN 37201",
    customerPhone: "+1 (555) 789-0123",
  },
]

export const mockPendingItems: PendingItem[] = [
  {
    id: "pending_1",
    type: "approval",
    title: "Payment pending approval",
    description: "Wire transfer of $5,000 to Wilson Dagah",
    amount: 5000,
    currency: "USD",
    createdAt: "2025-03-04T10:30:00",
    href: "/transactions",
  },
  {
    id: "pending_2",
    type: "failed",
    title: "Payment failed",
    description: "Vendor payment of $3,500 could not be processed",
    amount: 3500,
    currency: "USD",
    createdAt: "2025-03-03T14:20:00",
    href: "/transactions",
  },
]

export const mockCards: Card[] = [
  {
    id: "card_1",
    type: "debit",
    form: "virtual",
    last4: "1234",
    fullCardNumber: "4532 7788 9012 1234",
    cvv: "123",
    status: "active",
    expiryDate: "12/22",
    cardholderName: "Eddy Cusuma",
    balance: 5756,
    billingAddress: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
    },
  },
  {
    id: "card_2",
    type: "debit",
    form: "physical",
    last4: "5678",
    fullCardNumber: "4532 7788 9012 5678",
    cvv: "456",
    status: "inactive",
    expiryDate: "12/22",
    cardholderName: "Eddy Cusuma",
    balance: 5756,
    billingAddress: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
    },
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: "ETID000001",
    type: "ach",
    amount: 2500.0,
    description: "Salary Deposit",
    date: "2025-01-05",
    status: "completed",
    direction: "credit",
    category: "Income",
    reference: "ACH-2025-001",
  },
  {
    id: "ETID000002",
    type: "card",
    amount: 45.99,
    description: "Amazon Purchase",
    date: "2025-01-04",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Shopping",
    fee: 0,
    reference: "CARD-2025-002",
  },
  {
    id: "ETID000003",
    type: "wire",
    amount: 1000.0,
    description: "Wire Transfer to Savings",
    date: "2025-01-03",
    status: "completed",
    direction: "debit",
    category: "Transfer",
    fee: 15.0,
    reference: "WIRE-2025-003",
  },
  {
    id: "ETID000004",
    type: "book",
    amount: 500.0,
    description: "Internal Transfer",
    date: "2025-01-02",
    status: "completed",
    direction: "credit",
    category: "Transfer",
    reference: "BOOK-2025-004",
  },
  {
    id: "ETID000005",
    type: "ach",
    amount: 150.0,
    description: "Utility Payment",
    date: "2025-01-01",
    status: "completed",
    direction: "debit",
    category: "Bills",
    reference: "ACH-2025-005",
  },
  {
    id: "ETID000006",
    type: "card",
    amount: 89.99,
    description: "Netflix Subscription",
    date: "2024-12-30",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Subscription",
    fee: 0,
    reference: "CARD-2024-006",
  },
  {
    id: "ETID000007",
    type: "ach",
    amount: 3200.0,
    description: "Freelance Payment",
    date: "2024-12-28",
    status: "completed",
    direction: "credit",
    category: "Income",
    reference: "ACH-2024-007",
  },
  {
    id: "ETID000008",
    type: "wire",
    amount: 5000.0,
    description: "Investment Transfer",
    date: "2024-12-25",
    status: "completed",
    direction: "debit",
    category: "Investment",
    fee: 25.0,
    reference: "WIRE-2024-008",
  },
  {
    id: "ETID000009",
    type: "card",
    amount: 234.5,
    description: "Whole Foods Market",
    date: "2024-12-22",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Groceries",
    fee: 0,
    reference: "CARD-2024-009",
  },
  {
    id: "ETID000010",
    type: "book",
    amount: 1500.0,
    description: "Account Transfer",
    date: "2024-12-20",
    status: "completed",
    direction: "credit",
    category: "Transfer",
    reference: "BOOK-2024-010",
  },
  {
    id: "ETID000011",
    type: "ach",
    amount: 450.0,
    description: "Insurance Premium",
    date: "2024-12-18",
    status: "completed",
    direction: "debit",
    category: "Insurance",
    reference: "ACH-2024-011",
  },
  {
    id: "ETID000012",
    type: "card",
    amount: 125.0,
    description: "Gas Station",
    date: "2024-12-15",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Transportation",
    fee: 0,
    reference: "CARD-2024-012",
  },
  {
    id: "ETID000013",
    type: "wire",
    amount: 2500.0,
    description: "Vendor Payment",
    date: "2024-12-12",
    status: "pending",
    direction: "debit",
    category: "Business",
    fee: 15.0,
    reference: "WIRE-2024-013",
    transferId: "ETID000013",
  },
  {
    id: "ETID000026",
    type: "wire",
    amount: 5000.0,
    description: "Supplier Payment",
    date: "2025-01-15",
    status: "processing",
    direction: "debit",
    category: "Business",
    fee: 25.0,
    reference: "WIRE-2025-026",
    transferId: "ETID000026",
  },
  {
    id: "ETID000027",
    type: "ach",
    amount: 1200.0,
    description: "Payroll Batch",
    date: "2025-01-16",
    status: "processing",
    direction: "debit",
    category: "Business",
    reference: "ACH-2025-027",
    transferId: "ETID000027",
  },
  {
    id: "ETID000028",
    type: "ach",
    amount: 850.0,
    description: "Contractor Payment",
    date: "2025-01-17",
    status: "pending",
    direction: "debit",
    category: "Business",
    reference: "ACH-2025-028",
    transferId: "ETID000028",
  },
  {
    id: "ETID000014",
    type: "ach",
    amount: 1800.0,
    description: "Rent Payment",
    date: "2024-12-10",
    status: "completed",
    direction: "debit",
    category: "Housing",
    reference: "ACH-2024-014",
  },
  {
    id: "ETID000015",
    type: "card",
    amount: 67.5,
    description: "Restaurant Dining",
    date: "2024-12-08",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Dining",
    fee: 0,
    reference: "CARD-2024-015",
  },
  {
    id: "ETID000016",
    type: "book",
    amount: 800.0,
    description: "Savings Transfer",
    date: "2024-12-05",
    status: "completed",
    direction: "debit",
    category: "Savings",
    reference: "BOOK-2024-016",
  },
  {
    id: "ETID000017",
    type: "ach",
    amount: 4500.0,
    description: "Client Payment",
    date: "2024-12-03",
    status: "completed",
    direction: "credit",
    category: "Income",
    reference: "EINV-0010",
  },
  {
    id: "ETID000018",
    type: "card",
    amount: 199.99,
    description: "Apple Store",
    date: "2024-12-01",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Electronics",
    fee: 0,
    reference: "CARD-2024-018",
  },
  {
    id: "ETID000019",
    type: "wire",
    amount: 750.0,
    description: "Tax Payment",
    date: "2024-11-28",
    status: "completed",
    direction: "debit",
    category: "Tax",
    fee: 10.0,
    reference: "WIRE-2024-019",
  },
  {
    id: "ETID000020",
    type: "ach",
    amount: 320.0,
    description: "Gym Membership",
    date: "2024-11-25",
    status: "completed",
    direction: "debit",
    category: "Health",
    reference: "ACH-2024-020",
  },
  {
    id: "ETID000021",
    type: "card",
    amount: 55.0,
    description: "Coffee Shop",
    date: "2024-11-22",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Dining",
    fee: 0,
    reference: "CARD-2024-021",
  },
  {
    id: "ETID000022",
    type: "book",
    amount: 2000.0,
    description: "Emergency Fund Transfer",
    date: "2024-11-20",
    status: "completed",
    direction: "credit",
    category: "Savings",
    reference: "BOOK-2024-022",
  },
  {
    id: "ETID000023",
    type: "ach",
    amount: 890.0,
    description: "Car Payment",
    date: "2024-11-18",
    status: "completed",
    direction: "debit",
    category: "Transportation",
    reference: "ACH-2024-023",
  },
  {
    id: "ETID000024",
    type: "card",
    amount: 145.75,
    description: "Target Shopping",
    date: "2024-11-15",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Shopping",
    fee: 0,
    reference: "CARD-2024-024",
  },
  {
    id: "ETID000025",
    type: "wire",
    amount: 3500.0,
    description: "Contractor Payment",
    date: "2024-11-12",
    status: "failed",
    direction: "debit",
    category: "Business",
    fee: 20.0,
    reference: "WIRE-2024-025",
  },
]

export const mockCardTransactions: Transaction[] = [
  {
    id: "ETID000101",
    type: "card",
    amount: -2500.0,
    description: "Spotify Subscription",
    date: "2025-01-28T12:30:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Subscription",
    reference: "CARD-2025-101",
  },
  {
    id: "ETID000102",
    type: "card",
    amount: 750.0,
    description: "Freepik Sales",
    date: "2025-01-25T22:40:00",
    status: "completed",
    direction: "credit",
    cardId: "card_1",
    category: "Income",
    reference: "CARD-2025-102",
  },
  {
    id: "ETID000103",
    type: "card",
    amount: -150.0,
    description: "Mobile Service",
    date: "2025-01-20T22:40:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Bills",
    reference: "CARD-2025-103",
  },
  {
    id: "ETID000104",
    type: "card",
    amount: -1050.0,
    description: "Wilson",
    date: "2025-01-15T03:29:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Transfer",
    reference: "CARD-2025-104",
  },
  {
    id: "ETID000105",
    type: "card",
    amount: 840.0,
    description: "Emilly",
    date: "2025-01-14T22:40:00",
    status: "completed",
    direction: "credit",
    cardId: "card_1",
    category: "Transfer",
    reference: "CARD-2025-105",
  },
  {
    id: "ETID000106",
    type: "card",
    amount: -89.99,
    description: "Netflix Subscription",
    date: "2025-01-12T10:15:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Subscription",
    reference: "CARD-2025-106",
  },
  {
    id: "ETID000107",
    type: "card",
    amount: -234.5,
    description: "Whole Foods Market",
    date: "2025-01-10T14:20:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Groceries",
    reference: "CARD-2025-107",
  },
  {
    id: "ETID000108",
    type: "card",
    amount: -125.0,
    description: "Shell Gas Station",
    date: "2025-01-08T08:45:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Transportation",
    reference: "CARD-2025-108",
  },
  {
    id: "ETID000109",
    type: "card",
    amount: -67.5,
    description: "Chipotle Mexican Grill",
    date: "2025-01-06T12:30:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Dining",
    reference: "CARD-2025-109",
  },
  {
    id: "ETID000110",
    type: "card",
    amount: -199.99,
    description: "Apple Store",
    date: "2025-01-04T16:00:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Electronics",
    reference: "CARD-2025-110",
  },
  {
    id: "ETID000111",
    type: "card",
    amount: -55.0,
    description: "Starbucks Coffee",
    date: "2025-01-02T09:15:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Dining",
    reference: "CARD-2025-111",
  },
  {
    id: "ETID000112",
    type: "card",
    amount: -145.75,
    description: "Target Shopping",
    date: "2024-12-30T11:30:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Shopping",
    reference: "CARD-2024-112",
  },
  {
    id: "ETID000113",
    type: "card",
    amount: -320.0,
    description: "Equinox Gym",
    date: "2024-12-28T07:00:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Health",
    reference: "CARD-2024-113",
  },
  {
    id: "ETID000114",
    type: "card",
    amount: -78.9,
    description: "Uber Rides",
    date: "2024-12-26T18:45:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Transportation",
    reference: "CARD-2024-114",
  },
  {
    id: "ETID000115",
    type: "card",
    amount: -42.0,
    description: "AMC Theaters",
    date: "2024-12-24T20:00:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Entertainment",
    reference: "CARD-2024-115",
  },
  {
    id: "ETID000116",
    type: "card",
    amount: -167.5,
    description: "Costco Wholesale",
    date: "2024-12-22T13:15:00",
    status: "pending",
    direction: "debit",
    cardId: "card_1",
    category: "Shopping",
    reference: "CARD-2024-116",
  },
  {
    id: "ETID000121",
    type: "card",
    amount: -320.0,
    description: "Hotel Booking",
    date: "2025-01-18T14:00:00",
    status: "processing",
    direction: "debit",
    cardId: "card_1",
    category: "Travel",
    reference: "CARD-2025-121",
  },
  {
    id: "ETID000122",
    type: "card",
    amount: -89.0,
    description: "Software Subscription",
    date: "2025-01-19T09:30:00",
    status: "pending",
    direction: "debit",
    cardId: "card_1",
    category: "Subscription",
    reference: "CARD-2025-122",
  },
  {
    id: "ETID000123",
    type: "card",
    amount: 1200.0,
    description: "Refund - Returns",
    date: "2025-01-20T11:00:00",
    status: "processing",
    direction: "credit",
    cardId: "card_1",
    category: "Refund",
    reference: "CARD-2025-123",
  },
  {
    id: "ETID000117",
    type: "card",
    amount: -95.0,
    description: "CVS Pharmacy",
    date: "2024-12-20T10:30:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Health",
    reference: "CARD-2024-117",
  },
  {
    id: "ETID000118",
    type: "card",
    amount: -28.5,
    description: "Panera Bread",
    date: "2024-12-18T12:00:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Dining",
    reference: "CARD-2024-118",
  },
  {
    id: "ETID000119",
    type: "card",
    amount: -450.0,
    description: "Best Buy Electronics",
    date: "2024-12-16T15:45:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Electronics",
    reference: "CARD-2024-119",
  },
  {
    id: "ETID000120",
    type: "card",
    amount: -112.3,
    description: "Trader Joe's",
    date: "2024-12-14T17:20:00",
    status: "completed",
    direction: "debit",
    cardId: "card_1",
    category: "Groceries",
    reference: "CARD-2024-120",
  },
]

export const mockMonthlyExpenses = [
  { month: "Aug", amount: 8500 },
  { month: "Sep", amount: 9200 },
  { month: "Oct", amount: 7800 },
  { month: "Nov", amount: 10500 },
  { month: "Dec", amount: 12500 },
  { month: "Jan", amount: 9800 },
]

export const mockMonthlyIncome = [
  { month: "Aug", amount: 12000 },
  { month: "Sep", amount: 11500 },
  { month: "Oct", amount: 13200 },
  { month: "Nov", amount: 10800 },
  { month: "Dec", amount: 14200 },
  { month: "Jan", amount: 11800 },
]

export const currencyRates: Record<string, number> = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  NGN: 0.00065,
  KES: 0.0077,
  GHS: 0.065,
  RUB: 0.011,
}

export const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  KES: "KSh",
  GHS: "₵",
  RUB: "₽",
}

export const defaultCurrency = "USD"

export function convertToDefaultCurrency(amount: number, fromCurrency: string): number {
  return amount * currencyRates[fromCurrency]
}

export function getTotalBalanceInDefaultCurrency(): number {
  return mockAccounts.reduce((sum, acc) => {
    return sum + convertToDefaultCurrency(acc.balance, acc.currency)
  }, 0)
}

export function getCustomerStats(
  customerId: string,
  customerEmail: string,
  invoices: Invoice[]
): { totalInvoices: number; totalPaid: number; lastInvoiceDate: string } {
  const customerInvoices = invoices.filter(
    (inv) =>
      !inv.archived &&
      (inv.customerId === customerId ||
        inv.customerEmail?.toLowerCase() === customerEmail?.toLowerCase())
  )
  const totalPaid = customerInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0)
  const dates = customerInvoices
    .map((inv) => inv.finalizedDate ?? inv.createdDate)
    .filter(Boolean) as string[]
  const lastInvoiceDate = dates.length > 0 ? dates.sort().reverse()[0] : ""
  return {
    totalInvoices: customerInvoices.length,
    totalPaid,
    lastInvoiceDate,
  }
}
