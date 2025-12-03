// Bridge KYC helper functions for mobile app

/**
 * Check if country is USA
 */
export function isUSACountry(countryCode: string): boolean {
  return countryCode?.toUpperCase() === 'US' || countryCode?.toUpperCase() === 'USA'
}

/**
 * Check if country is in EEA (European Economic Area)
 */
export function isEEACountry(countryCode: string): boolean {
  const eeaCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
  ]
  return eeaCountries.includes(countryCode?.toUpperCase())
}

/**
 * Get which Bridge fields are required based on country
 */
export function getBridgeRequiredFields(countryCode: string): {
  us: boolean
  eea: boolean
  international: boolean
} {
  const us = isUSACountry(countryCode)
  const eea = isEEACountry(countryCode)
  const international = !us && !eea
  
  return { us, eea, international }
}

/**
 * Format employment status for Bridge API
 * Maps UI values to Bridge expected values
 */
export function formatEmploymentStatus(value: string): string {
  const mapping: Record<string, string> = {
    'employed': 'employed',
    'unemployed': 'unemployed',
    'self_employed': 'self_employed',
    'retired': 'retired',
    'student': 'student',
  }
  return mapping[value] || value
}

/**
 * Format expected monthly flows for Bridge API
 * Maps UI ranges to Bridge format
 */
export function formatExpectedMonthly(value: string): string {
  const mapping: Record<string, string> = {
    '0_999': '0_999',
    '1000_4999': '1000_4999',
    '5000_9999': '5000_9999',
    '10000_plus': '10000_plus',
  }
  return mapping[value] || value
}

/**
 * Format account purpose for Bridge API
 */
export function formatAccountPurpose(value: string): string {
  const mapping: Record<string, string> = {
    'purchase_goods_and_services': 'purchase_goods_and_services',
    'receive_payments': 'receive_payments',
    'send_payments': 'send_payments',
    'savings': 'savings',
    'investment': 'investment',
    'other': 'other',
  }
  return mapping[value] || value
}

/**
 * Format source of funds for Bridge API
 */
export function formatSourceOfFunds(value: string): string {
  const mapping: Record<string, string> = {
    'salary': 'salary',
    'business_income': 'business_income',
    'investments': 'investments',
    'inheritance': 'inheritance',
    'gift': 'gift',
    'savings': 'savings',
    'other': 'other',
  }
  return mapping[value] || value
}

/**
 * Employment status options for dropdown
 */
export const EMPLOYMENT_STATUS_OPTIONS = [
  { label: 'Employed', value: 'employed' },
  { label: 'Unemployed', value: 'unemployed' },
  { label: 'Self-Employed', value: 'self_employed' },
  { label: 'Retired', value: 'retired' },
  { label: 'Student', value: 'student' },
]

/**
 * Expected monthly flow ranges for dropdown
 */
export const EXPECTED_MONTHLY_OPTIONS = [
  { label: '$0 - $999', value: '0_999' },
  { label: '$1,000 - $4,999', value: '1000_4999' },
  { label: '$5,000 - $9,999', value: '5000_9999' },
  { label: '$10,000+', value: '10000_plus' },
]

/**
 * Account purpose options for dropdown
 */
/**
 * Account purpose options for dropdown
 * Must match Bridge's allowed values exactly:
 * business_transactions, charitable_donations, ecommerce_retail_payments,
 * investment_purposes, operating_a_company, other,
 * payments_to_friends_or_family_abroad, personal_or_living_expenses,
 * protect_wealth, purchase_goods_and_services,
 * receive_payment_for_freelancing, receive_salary
 */
export const ACCOUNT_PURPOSE_OPTIONS = [
  { label: 'Personal or Living Expenses', value: 'personal_or_living_expenses' },
  { label: 'Purchase Goods and Services', value: 'purchase_goods_and_services' },
  { label: 'Receive Payment for Freelancing', value: 'receive_payment_for_freelancing' },
  { label: 'Receive Salary', value: 'receive_salary' },
  { label: 'Payments to Friends or Family Abroad', value: 'payments_to_friends_or_family_abroad' },
  { label: 'Business Transactions', value: 'business_transactions' },
  { label: 'Operating a Company', value: 'operating_a_company' },
  { label: 'Investment Purposes', value: 'investment_purposes' },
  { label: 'Protect Wealth', value: 'protect_wealth' },
  { label: 'Ecommerce/Retail Payments', value: 'ecommerce_retail_payments' },
  { label: 'Charitable Donations', value: 'charitable_donations' },
  { label: 'Other', value: 'other' },
]

/**
 * Source of funds options for dropdown
 * Must match Bridge's allowed values: business_income, company_funds, investments_loans,
 * pension_retirement, salary, savings, someone_elses_funds
 */
export const SOURCE_OF_FUNDS_OPTIONS = [
  { label: 'Salary', value: 'salary' },
  { label: 'Business Income', value: 'business_income' },
  { label: 'Company Funds', value: 'company_funds' },
  { label: 'Investments/Loans', value: 'investments_loans' },
  { label: 'Pension/Retirement', value: 'pension_retirement' },
  { label: 'Savings', value: 'savings' },
  { label: 'Someone Else\'s Funds', value: 'someone_elses_funds' },
]

