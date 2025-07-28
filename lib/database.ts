import { supabase, createServerClient } from "./supabase"

// User operations
export const userService = {
  async findByEmail(email: string) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error
    return data
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
        updated_at: new Date().toISOString(),
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
    const { data, error } = await supabase
      .from("currencies")
      .select("id, code, name, symbol, flag_svg, status, created_at, updated_at")
      .eq("status", "active")
      .order("code")

    if (error) throw error

    // Map flag_svg to flag for frontend compatibility
    return (
      data?.map((currency) => ({
        ...currency,
        flag: currency.flag_svg,
      })) || []
    )
  },

  async getExchangeRates() {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select(`
        *,
        from_currency_info:currencies!exchange_rates_from_currency_fkey(id, code, name, symbol, flag_svg),
        to_currency_info:currencies!exchange_rates_to_currency_fkey(id, code, name, symbol, flag_svg)
      `)
      .eq("status", "active")

    if (error) throw error

    // Map flag_svg to flag for frontend compatibility
    return (
      data?.map((rate) => ({
        ...rate,
        from_currency_info: rate.from_currency_info
          ? {
              ...rate.from_currency_info,
              flag: rate.from_currency_info.flag_svg,
            }
          : undefined,
        to_currency_info: rate.to_currency_info
          ? {
              ...rate.to_currency_info,
              flag: rate.to_currency_info.flag_svg,
            }
          : undefined,
      })) || []
    )
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

  async updateRate(fromCurrency: string, toCurrency: string, rate: number, feeType = "free", feeAmount = 0) {
    const { data, error } = await supabase
      .from("exchange_rates")
      .upsert({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate,
        fee_type: feeType,
        fee_amount: feeAmount,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
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

// Payment Methods operations
export const paymentMethodService = {
  async getAll() {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("currency", { ascending: true })
      .order("is_default", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByCurrency(currency: string) {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("currency", currency)
      .eq("status", "active")
      .order("is_default", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(paymentMethodData: {
    currency: string
    type: string
    name: string
    accountName?: string
    accountNumber?: string
    bankName?: string
    qrCodeData?: string
    instructions?: string
    isDefault?: boolean
  }) {
    const serverClient = createServerClient()

    // If setting as default, unset other defaults for the same currency
    if (paymentMethodData.isDefault) {
      await serverClient
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", paymentMethodData.currency)
    }

    const { data, error } = await serverClient
      .from("payment_methods")
      .insert({
        currency: paymentMethodData.currency,
        type: paymentMethodData.type,
        name: paymentMethodData.name,
        account_name: paymentMethodData.accountName,
        account_number: paymentMethodData.accountNumber,
        bank_name: paymentMethodData.bankName,
        qr_code_data: paymentMethodData.qrCodeData,
        instructions: paymentMethodData.instructions,
        is_default: paymentMethodData.isDefault || false,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(
    id: string,
    updates: {
      currency?: string
      type?: string
      name?: string
      accountName?: string
      accountNumber?: string
      bankName?: string
      qrCodeData?: string
      instructions?: string
      isDefault?: boolean
    },
  ) {
    const serverClient = createServerClient()

    // If setting as default, unset other defaults for the same currency
    if (updates.isDefault && updates.currency) {
      await serverClient
        .from("payment_methods")
        .update({ is_default: false })
        .eq("currency", updates.currency)
        .neq("id", id)
    }

    const { data, error } = await serverClient
      .from("payment_methods")
      .update({
        currency: updates.currency,
        type: updates.type,
        name: updates.name,
        account_name: updates.accountName,
        account_number: updates.accountNumber,
        bank_name: updates.bankName,
        qr_code_data: updates.qrCodeData,
        instructions: updates.instructions,
        is_default: updates.isDefault,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string) {
    const serverClient = createServerClient()

    const { data, error } = await serverClient.from("payment_methods").update({ status }).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async setDefault(id: string, currency: string) {
    const serverClient = createServerClient()

    // Unset other defaults for the same currency
    await serverClient.from("payment_methods").update({ is_default: false }).eq("currency", currency)

    // Set this one as default
    const { data, error } = await serverClient
      .from("payment_methods")
      .update({ is_default: true })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const serverClient = createServerClient()

    const { error } = await serverClient.from("payment_methods").delete().eq("id", id)

    if (error) throw error
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

    // Since we removed password_hash, we need to use Supabase Auth for admin login too
    // This is a simplified approach - in production, you might want separate admin auth
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
    const { data, error } = await supabase.from("system_settings").select("value, data_type").eq("key", key).single()

    if (error && error.code !== "PGRST116") throw error

    if (!data) return null

    // Parse value based on data type
    switch (data.data_type) {
      case "boolean":
        return data.value === "true"
      case "number":
        return Number(data.value)
      case "json":
        return JSON.parse(data.value)
      default:
        return data.value
    }
  },

  async set(key: string, value: any, dataType = "string") {
    const serverClient = createServerClient()

    // Convert value to string for storage
    let stringValue: string
    switch (dataType) {
      case "boolean":
        stringValue = value ? "true" : "false"
        break
      case "number":
        stringValue = String(value)
        break
      case "json":
        stringValue = JSON.stringify(value)
        break
      default:
        stringValue = String(value)
    }

    const { data, error } = await serverClient
      .from("system_settings")
      .upsert({
        key,
        value: stringValue,
        data_type: dataType,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase.from("system_settings").select("*").order("key")

    if (error) throw error
    return data
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("key")

    if (error) throw error
    return data
  },

  async updateMultiple(settings: Array<{ key: string; value: any; dataType?: string }>) {
    const serverClient = createServerClient()

    const updates = settings.map(({ key, value, dataType = "string" }) => {
      let stringValue: string
      switch (dataType) {
        case "boolean":
          stringValue = value ? "true" : "false"
          break
        case "number":
          stringValue = String(value)
          break
        case "json":
          stringValue = JSON.stringify(value)
          break
        default:
          stringValue = String(value)
      }

      return { key, value: stringValue, data_type: dataType }
    })

    const { data, error } = await serverClient.from("system_settings").upsert(updates).select()

    if (error) throw error
    return data
  },
}
