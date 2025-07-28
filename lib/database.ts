import { supabase, createServerClient } from "./supabase"
import bcrypt from "bcryptjs"

// User operations
export const userService = {
  async create(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    baseCurrency?: string
    country?: string
  }) {
    const passwordHash = await bcrypt.hash(userData.password, 10)

    const { data, error } = await supabase
      .from("users")
      .insert({
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        base_currency: userData.baseCurrency || "NGN",
        country: userData.country,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findByEmail(email: string) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async verifyPassword(email: string, password: string) {
    const user = await this.findByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return null

    // Update last login
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    return user
  },

  async updateProfile(
    userId: string,
    updates: {
      firstName?: string
      lastName?: string
      phone?: string
      baseCurrency?: string
    },
  ) {
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        base_currency: updates.baseCurrency,
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getStats() {
    const { data: totalUsers } = await supabase.from("users").select("id", { count: "exact" })

    const { data: activeUsers } = await supabase.from("users").select("id", { count: "exact" }).eq("status", "active")

    const { data: verifiedUsers } = await supabase
      .from("users")
      .select("id", { count: "exact" })
      .eq("verification_status", "verified")

    return {
      total: totalUsers?.length || 0,
      active: activeUsers?.length || 0,
      verified: verifiedUsers?.length || 0,
    }
  },
}

// Currency operations
export const currencyService = {
  async getAll() {
    const { data, error } = await supabase.from("currencies").select("*").eq("status", "active").order("code")

    if (error) throw error
    return data
  },

  async getExchangeRates() {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select(`
        *,
        from_currency_info:currencies!exchange_rates_from_currency_fkey(*),
        to_currency_info:currencies!exchange_rates_to_currency_fkey(*)
      `)
      .eq("status", "active")

    if (error) throw error
    return data
  },

  async getRate(fromCurrency: string, toCurrency: string) {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("from_currency", fromCurrency)
      .eq("to_currency", toCurrency)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },
}

// Recipient operations
export const recipientService = {
  async create(
    userId: string,
    recipientData: {
      fullName: string
      accountNumber: string
      bankName: string
      phoneNumber?: string
      currency: string
    },
  ) {
    const { data, error } = await supabase
      .from("recipients")
      .insert({
        user_id: userId,
        full_name: recipientData.fullName,
        account_number: recipientData.accountNumber,
        bank_name: recipientData.bankName,
        phone_number: recipientData.phoneNumber,
        currency: recipientData.currency,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async update(
    recipientId: string,
    updates: {
      fullName?: string
      accountNumber?: string
      bankName?: string
      phoneNumber?: string
    },
  ) {
    const { data, error } = await supabase
      .from("recipients")
      .update({
        full_name: updates.fullName,
        account_number: updates.accountNumber,
        bank_name: updates.bankName,
        phone_number: updates.phoneNumber,
      })
      .eq("id", recipientId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(recipientId: string) {
    const { error } = await supabase.from("recipients").delete().eq("id", recipientId)

    if (error) throw error
  },
}

// Transaction operations
export const transactionService = {
  async create(transactionData: {
    userId: string
    recipientId: string
    sendAmount: number
    sendCurrency: string
    receiveAmount: number
    receiveCurrency: string
    exchangeRate: number
    feeAmount: number
    feeType: string
    totalAmount: number
    reference?: string
  }) {
    const transactionId = `NP${Date.now()}`

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        transaction_id: transactionId,
        user_id: transactionData.userId,
        recipient_id: transactionData.recipientId,
        send_amount: transactionData.sendAmount,
        send_currency: transactionData.sendCurrency,
        receive_amount: transactionData.receiveAmount,
        receive_currency: transactionData.receiveCurrency,
        exchange_rate: transactionData.exchangeRate,
        fee_amount: transactionData.feeAmount,
        fee_type: transactionData.feeType,
        total_amount: transactionData.totalAmount,
        reference: transactionData.reference,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        recipient:recipients(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async getById(transactionId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .eq("transaction_id", transactionId)
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(transactionId: string, status: string) {
    const updates: any = { status }
    if (status === "completed") {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("transaction_id", transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async uploadReceipt(transactionId: string, receiptUrl: string, filename: string) {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        receipt_url: receiptUrl,
        receipt_filename: filename,
      })
      .eq("transaction_id", transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getStats(timeRange = "today") {
    const dateFilter = new Date()

    switch (timeRange) {
      case "today":
        dateFilter.setHours(0, 0, 0, 0)
        break
      case "week":
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case "month":
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
    }

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .gte("created_at", dateFilter.toISOString())

    const { data: pendingTransactions } = await supabase
      .from("transactions")
      .select("id", { count: "exact" })
      .in("status", ["pending", "processing"])

    const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.send_amount), 0) || 0

    return {
      totalTransactions: transactions?.length || 0,
      totalVolume,
      pendingTransactions: pendingTransactions?.length || 0,
    }
  },
}

// Admin operations
export const adminService = {
  async verifyAdmin(email: string, password: string) {
    const serverClient = createServerClient()

    const { data: admin, error } = await serverClient
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error || !admin) return null

    const isValid = await bcrypt.compare(password, admin.password_hash)
    if (!isValid) return null

    // Update last login
    await serverClient.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", admin.id)

    return admin
  },

  async getAllTransactions(
    filters: {
      status?: string
      currency?: string
      search?: string
      limit?: number
    } = {},
  ) {
    const serverClient = createServerClient()
    let query = serverClient.from("transactions").select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters.currency && filters.currency !== "all") {
      query = query.or(`send_currency.eq.${filters.currency},receive_currency.eq.${filters.currency}`)
    }

    if (filters.search) {
      query = query.or(`transaction_id.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(filters.limit || 100)

    if (error) throw error
    return data
  },

  async getAllUsers(
    filters: {
      status?: string
      verification?: string
      search?: string
      limit?: number
    } = {},
  ) {
    const serverClient = createServerClient()
    let query = serverClient.from("users").select("*")

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters.verification && filters.verification !== "all") {
      query = query.eq("verification_status", filters.verification)
    }

    if (filters.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`,
      )
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(filters.limit || 100)

    if (error) throw error
    return data
  },
}

// System settings operations
export const settingsService = {
  async get(key: string) {
    const { data, error } = await supabase.from("system_settings").select("value").eq("key", key).single()

    if (error && error.code !== "PGRST116") throw error
    return data?.value
  },

  async set(key: string, value: string) {
    const { data, error } = await supabase.from("system_settings").upsert({ key, value }).select().single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase.from("system_settings").select("*").order("key")

    if (error) throw error
    return data
  },
}
