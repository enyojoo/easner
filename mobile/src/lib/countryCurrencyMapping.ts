/**
 * Country to Currency Mapping
 * Maps countries to their primary currencies for bank account selection
 */

export interface CountryCurrency {
  countryCode: string
  countryName: string
  currencyCode: string
  currencyName: string
  flagEmoji: string
}

// Comprehensive mapping of countries to currencies
export const countryCurrencyMap: CountryCurrency[] = [
  // North America
  { countryCode: 'US', countryName: 'United States', currencyCode: 'USD', currencyName: 'US Dollar', flagEmoji: '🇺🇸' },
  { countryCode: 'CA', countryName: 'Canada', currencyCode: 'CAD', currencyName: 'Canadian Dollar', flagEmoji: '🇨🇦' },
  { countryCode: 'MX', countryName: 'Mexico', currencyCode: 'MXN', currencyName: 'Mexican Peso', flagEmoji: '🇲🇽' },
  
  // Europe
  { countryCode: 'GB', countryName: 'United Kingdom', currencyCode: 'GBP', currencyName: 'British Pound', flagEmoji: '🇬🇧' },
  { countryCode: 'DE', countryName: 'Germany', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇩🇪' },
  { countryCode: 'FR', countryName: 'France', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇫🇷' },
  { countryCode: 'IT', countryName: 'Italy', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇮🇹' },
  { countryCode: 'ES', countryName: 'Spain', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇪🇸' },
  { countryCode: 'NL', countryName: 'Netherlands', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇳🇱' },
  { countryCode: 'BE', countryName: 'Belgium', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇧🇪' },
  { countryCode: 'AT', countryName: 'Austria', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇦🇹' },
  { countryCode: 'PT', countryName: 'Portugal', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇵🇹' },
  { countryCode: 'GR', countryName: 'Greece', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇬🇷' },
  { countryCode: 'IE', countryName: 'Ireland', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇮🇪' },
  { countryCode: 'FI', countryName: 'Finland', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇫🇮' },
  { countryCode: 'PL', countryName: 'Poland', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇵🇱' },
  { countryCode: 'RO', countryName: 'Romania', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇷🇴' },
  { countryCode: 'CZ', countryName: 'Czech Republic', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇨🇿' },
  { countryCode: 'HU', countryName: 'Hungary', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇭🇺' },
  { countryCode: 'BG', countryName: 'Bulgaria', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇧🇬' },
  { countryCode: 'HR', countryName: 'Croatia', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇭🇷' },
  { countryCode: 'SI', countryName: 'Slovenia', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇸🇮' },
  { countryCode: 'SK', countryName: 'Slovakia', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇸🇰' },
  { countryCode: 'LT', countryName: 'Lithuania', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇱🇹' },
  { countryCode: 'LV', countryName: 'Latvia', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇱🇻' },
  { countryCode: 'EE', countryName: 'Estonia', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇪🇪' },
  { countryCode: 'MT', countryName: 'Malta', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇲🇹' },
  { countryCode: 'CY', countryName: 'Cyprus', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇨🇾' },
  { countryCode: 'LU', countryName: 'Luxembourg', currencyCode: 'EUR', currencyName: 'Euro', flagEmoji: '🇱🇺' },
  { countryCode: 'CH', countryName: 'Switzerland', currencyCode: 'CHF', currencyName: 'Swiss Franc', flagEmoji: '🇨🇭' },
  { countryCode: 'SE', countryName: 'Sweden', currencyCode: 'SEK', currencyName: 'Swedish Krona', flagEmoji: '🇸🇪' },
  { countryCode: 'NO', countryName: 'Norway', currencyCode: 'NOK', currencyName: 'Norwegian Krone', flagEmoji: '🇳🇴' },
  { countryCode: 'DK', countryName: 'Denmark', currencyCode: 'DKK', currencyName: 'Danish Krone', flagEmoji: '🇩🇰' },
  { countryCode: 'IS', countryName: 'Iceland', currencyCode: 'ISK', currencyName: 'Icelandic Krona', flagEmoji: '🇮🇸' },
  
  // Africa
  { countryCode: 'NG', countryName: 'Nigeria', currencyCode: 'NGN', currencyName: 'Nigerian Naira', flagEmoji: '🇳🇬' },
  { countryCode: 'KE', countryName: 'Kenya', currencyCode: 'KES', currencyName: 'Kenyan Shilling', flagEmoji: '🇰🇪' },
  { countryCode: 'GH', countryName: 'Ghana', currencyCode: 'GHS', currencyName: 'Ghanaian Cedi', flagEmoji: '🇬🇭' },
  { countryCode: 'ZA', countryName: 'South Africa', currencyCode: 'ZAR', currencyName: 'South African Rand', flagEmoji: '🇿🇦' },
  { countryCode: 'EG', countryName: 'Egypt', currencyCode: 'EGP', currencyName: 'Egyptian Pound', flagEmoji: '🇪🇬' },
  { countryCode: 'MA', countryName: 'Morocco', currencyCode: 'MAD', currencyName: 'Moroccan Dirham', flagEmoji: '🇲🇦' },
  { countryCode: 'TN', countryName: 'Tunisia', currencyCode: 'TND', currencyName: 'Tunisian Dinar', flagEmoji: '🇹🇳' },
  { countryCode: 'DZ', countryName: 'Algeria', currencyCode: 'DZD', currencyName: 'Algerian Dinar', flagEmoji: '🇩🇿' },
  { countryCode: 'ET', countryName: 'Ethiopia', currencyCode: 'ETB', currencyName: 'Ethiopian Birr', flagEmoji: '🇪🇹' },
  { countryCode: 'TZ', countryName: 'Tanzania', currencyCode: 'TZS', currencyName: 'Tanzanian Shilling', flagEmoji: '🇹🇿' },
  { countryCode: 'UG', countryName: 'Uganda', currencyCode: 'UGX', currencyName: 'Ugandan Shilling', flagEmoji: '🇺🇬' },
  { countryCode: 'RW', countryName: 'Rwanda', currencyCode: 'RWF', currencyName: 'Rwandan Franc', flagEmoji: '🇷🇼' },
  { countryCode: 'SN', countryName: 'Senegal', currencyCode: 'XOF', currencyName: 'West African CFA Franc', flagEmoji: '🇸🇳' },
  { countryCode: 'CI', countryName: 'Ivory Coast', currencyCode: 'XOF', currencyName: 'West African CFA Franc', flagEmoji: '🇨🇮' },
  { countryCode: 'CM', countryName: 'Cameroon', currencyCode: 'XAF', currencyName: 'Central African CFA Franc', flagEmoji: '🇨🇲' },
  { countryCode: 'AO', countryName: 'Angola', currencyCode: 'AOA', currencyName: 'Angolan Kwanza', flagEmoji: '🇦🇴' },
  { countryCode: 'MZ', countryName: 'Mozambique', currencyCode: 'MZN', currencyName: 'Mozambican Metical', flagEmoji: '🇲🇿' },
  { countryCode: 'ZW', countryName: 'Zimbabwe', currencyCode: 'ZWL', currencyName: 'Zimbabwean Dollar', flagEmoji: '🇿🇼' },
  { countryCode: 'BW', countryName: 'Botswana', currencyCode: 'BWP', currencyName: 'Botswana Pula', flagEmoji: '🇧🇼' },
  { countryCode: 'NA', countryName: 'Namibia', currencyCode: 'NAD', currencyName: 'Namibian Dollar', flagEmoji: '🇳🇦' },
  { countryCode: 'ZM', countryName: 'Zambia', currencyCode: 'ZMW', currencyName: 'Zambian Kwacha', flagEmoji: '🇿🇲' },
  { countryCode: 'MW', countryName: 'Malawi', currencyCode: 'MWK', currencyName: 'Malawian Kwacha', flagEmoji: '🇲🇼' },
  
  // Asia
  { countryCode: 'AU', countryName: 'Australia', currencyCode: 'AUD', currencyName: 'Australian Dollar', flagEmoji: '🇦🇺' },
  { countryCode: 'NZ', countryName: 'New Zealand', currencyCode: 'NZD', currencyName: 'New Zealand Dollar', flagEmoji: '🇳🇿' },
  { countryCode: 'IN', countryName: 'India', currencyCode: 'INR', currencyName: 'Indian Rupee', flagEmoji: '🇮🇳' },
  { countryCode: 'PK', countryName: 'Pakistan', currencyCode: 'PKR', currencyName: 'Pakistani Rupee', flagEmoji: '🇵🇰' },
  { countryCode: 'BD', countryName: 'Bangladesh', currencyCode: 'BDT', currencyName: 'Bangladeshi Taka', flagEmoji: '🇧🇩' },
  { countryCode: 'PH', countryName: 'Philippines', currencyCode: 'PHP', currencyName: 'Philippine Peso', flagEmoji: '🇵🇭' },
  { countryCode: 'ID', countryName: 'Indonesia', currencyCode: 'IDR', currencyName: 'Indonesian Rupiah', flagEmoji: '🇮🇩' },
  { countryCode: 'MY', countryName: 'Malaysia', currencyCode: 'MYR', currencyName: 'Malaysian Ringgit', flagEmoji: '🇲🇾' },
  { countryCode: 'SG', countryName: 'Singapore', currencyCode: 'SGD', currencyName: 'Singapore Dollar', flagEmoji: '🇸🇬' },
  { countryCode: 'TH', countryName: 'Thailand', currencyCode: 'THB', currencyName: 'Thai Baht', flagEmoji: '🇹🇭' },
  { countryCode: 'VN', countryName: 'Vietnam', currencyCode: 'VND', currencyName: 'Vietnamese Dong', flagEmoji: '🇻🇳' },
  { countryCode: 'CN', countryName: 'China', currencyCode: 'CNY', currencyName: 'Chinese Yuan', flagEmoji: '🇨🇳' },
  { countryCode: 'JP', countryName: 'Japan', currencyCode: 'JPY', currencyName: 'Japanese Yen', flagEmoji: '🇯🇵' },
  { countryCode: 'KR', countryName: 'South Korea', currencyCode: 'KRW', currencyName: 'South Korean Won', flagEmoji: '🇰🇷' },
  { countryCode: 'HK', countryName: 'Hong Kong', currencyCode: 'HKD', currencyName: 'Hong Kong Dollar', flagEmoji: '🇭🇰' },
  { countryCode: 'TW', countryName: 'Taiwan', currencyCode: 'TWD', currencyName: 'Taiwanese Dollar', flagEmoji: '🇹🇼' },
  
  // Middle East
  { countryCode: 'SA', countryName: 'Saudi Arabia', currencyCode: 'SAR', currencyName: 'Saudi Riyal', flagEmoji: '🇸🇦' },
  { countryCode: 'AE', countryName: 'United Arab Emirates', currencyCode: 'AED', currencyName: 'UAE Dirham', flagEmoji: '🇦🇪' },
  { countryCode: 'QA', countryName: 'Qatar', currencyCode: 'QAR', currencyName: 'Qatari Riyal', flagEmoji: '🇶🇦' },
  { countryCode: 'KW', countryName: 'Kuwait', currencyCode: 'KWD', currencyName: 'Kuwaiti Dinar', flagEmoji: '🇰🇼' },
  { countryCode: 'BH', countryName: 'Bahrain', currencyCode: 'BHD', currencyName: 'Bahraini Dinar', flagEmoji: '🇧🇭' },
  { countryCode: 'OM', countryName: 'Oman', currencyCode: 'OMR', currencyName: 'Omani Rial', flagEmoji: '🇴🇲' },
  { countryCode: 'TR', countryName: 'Turkey', currencyCode: 'TRY', currencyName: 'Turkish Lira', flagEmoji: '🇹🇷' },
  { countryCode: 'IL', countryName: 'Israel', currencyCode: 'ILS', currencyName: 'Israeli Shekel', flagEmoji: '🇮🇱' },
  { countryCode: 'JO', countryName: 'Jordan', currencyCode: 'JOD', currencyName: 'Jordanian Dinar', flagEmoji: '🇯🇴' },
  { countryCode: 'LB', countryName: 'Lebanon', currencyCode: 'LBP', currencyName: 'Lebanese Pound', flagEmoji: '🇱🇧' },
  
  // South America
  { countryCode: 'BR', countryName: 'Brazil', currencyCode: 'BRL', currencyName: 'Brazilian Real', flagEmoji: '🇧🇷' },
  { countryCode: 'AR', countryName: 'Argentina', currencyCode: 'ARS', currencyName: 'Argentine Peso', flagEmoji: '🇦🇷' },
  { countryCode: 'CO', countryName: 'Colombia', currencyCode: 'COP', currencyName: 'Colombian Peso', flagEmoji: '🇨🇴' },
  { countryCode: 'PE', countryName: 'Peru', currencyCode: 'PEN', currencyName: 'Peruvian Sol', flagEmoji: '🇵🇪' },
  { countryCode: 'CL', countryName: 'Chile', currencyCode: 'CLP', currencyName: 'Chilean Peso', flagEmoji: '🇨🇱' },
]

/**
 * Get all countries with currencies
 */
export function getAllCountryCurrencies(): CountryCurrency[] {
  return countryCurrencyMap
}

/**
 * Get country currency by country code
 */
export function getCountryCurrency(countryCode: string): CountryCurrency | undefined {
  return countryCurrencyMap.find(cc => cc.countryCode === countryCode)
}

/**
 * Get country currency by currency code
 */
export function getCountryCurrencyByCurrency(currencyCode: string): CountryCurrency[] {
  return countryCurrencyMap.filter(cc => cc.currencyCode === currencyCode)
}

/**
 * Search countries by name or currency
 */
export function searchCountryCurrencies(query: string): CountryCurrency[] {
  const lowerQuery = query.toLowerCase()
  return countryCurrencyMap.filter(cc => 
    cc.countryName.toLowerCase().includes(lowerQuery) ||
    cc.currencyCode.toLowerCase().includes(lowerQuery) ||
    cc.currencyName.toLowerCase().includes(lowerQuery)
  )
}
