import { supabase } from './supabase'

export interface UserProfileData {
  firstName: string
  lastName: string
  phone: string
  baseCurrency: string
}

export interface UserStats {
  totalTransactions: number
  totalSent: number
  memberSince: string
}

export const userService = {
  async updateProfile(
    userId: string,
    updates: UserProfileData
  ): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        base_currency: updates.baseCurrency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getUserStats(
    userId: string,
    transactions: any[],
    exchangeRates: any[],
    baseCurrency: string,
    userProfile: any
  ): Promise<UserStats> {
    let totalSentInBaseCurrency = 0

    // Calculate total sent in base currency for completed transactions
    for (const transaction of transactions) {
      if (transaction.status === 'completed') {
        let amountInBaseCurrency = transaction.send_amount

        // If transaction currency is different from base currency, convert it
        if (transaction.send_currency !== baseCurrency) {
          // Find exchange rate from transaction currency to base currency
          const rate = exchangeRates.find(
            (r) => r.from_currency === transaction.send_currency && r.to_currency === baseCurrency
          )

          if (rate) {
            amountInBaseCurrency = transaction.send_amount * rate.rate
          } else {
            // If direct rate not found, try reverse rate
            const reverseRate = exchangeRates.find(
              (r) => r.from_currency === baseCurrency && r.to_currency === transaction.send_currency
            )
            if (reverseRate && reverseRate.rate > 0) {
              amountInBaseCurrency = transaction.send_amount / reverseRate.rate
            }
          }
        }

        totalSentInBaseCurrency += amountInBaseCurrency
      }
    }

    // Get member since date from user profile
    const memberSince = userProfile?.profile?.created_at
      ? new Date(userProfile.profile.created_at).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })
      : 'N/A'

    return {
      totalTransactions: transactions.filter((t) => t.status === 'completed').length,
      totalSent: totalSentInBaseCurrency,
      memberSince,
    }
  },
}
