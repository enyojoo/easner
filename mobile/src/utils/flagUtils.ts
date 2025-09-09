/**
 * Comprehensive country flag mapping for all world currencies
 * Maps currency codes to their respective country flag emojis
 */

export const CURRENCY_FLAG_MAP: { [key: string]: string } = {
  // Major Currencies
  'USD': '🇺🇸', // United States Dollar
  'EUR': '🇪🇺', // Euro
  'GBP': '🇬🇧', // British Pound Sterling
  'JPY': '🇯🇵', // Japanese Yen
  'CHF': '🇨🇭', // Swiss Franc
  'CAD': '🇨🇦', // Canadian Dollar
  'AUD': '🇦🇺', // Australian Dollar
  'NZD': '🇳🇿', // New Zealand Dollar
  
  // African Currencies
  'NGN': '🇳🇬', // Nigerian Naira
  'ZAR': '🇿🇦', // South African Rand
  'EGP': '🇪🇬', // Egyptian Pound
  'KES': '🇰🇪', // Kenyan Shilling
  'GHS': '🇬🇭', // Ghanaian Cedi
  'ETB': '🇪🇹', // Ethiopian Birr
  'UGX': '🇺🇬', // Ugandan Shilling
  'TZS': '🇹🇿', // Tanzanian Shilling
  'MAD': '🇲🇦', // Moroccan Dirham
  'TND': '🇹🇳', // Tunisian Dinar
  'DZD': '🇩🇿', // Algerian Dinar
  'LYD': '🇱🇾', // Libyan Dinar
  'XOF': '🇸🇳', // West African CFA Franc (Senegal)
  'XAF': '🇨🇲', // Central African CFA Franc (Cameroon)
  'BWP': '🇧🇼', // Botswana Pula
  'ZMW': '🇿🇲', // Zambian Kwacha
  'MWK': '🇲🇼', // Malawian Kwacha
  'BIF': '🇧🇮', // Burundian Franc
  'RWF': '🇷🇼', // Rwandan Franc
  'SLL': '🇸🇱', // Sierra Leonean Leone
  'LRD': '🇱🇷', // Liberian Dollar
  'GMD': '🇬🇲', // Gambian Dalasi
  'SLE': '🇸🇱', // Sierra Leonean Leone (new)
  'CDF': '🇨🇩', // Congolese Franc
  'AOA': '🇦🇴', // Angolan Kwanza
  'MZN': '🇲🇿', // Mozambican Metical
  'SZL': '🇸🇿', // Swazi Lilangeni
  'LSL': '🇱🇸', // Lesotho Loti
  'NAD': '🇳🇦', // Namibian Dollar
  
  // Asian Currencies
  'CNY': '🇨🇳', // Chinese Yuan
  'INR': '🇮🇳', // Indian Rupee
  'KRW': '🇰🇷', // South Korean Won
  'SGD': '🇸🇬', // Singapore Dollar
  'HKD': '🇭🇰', // Hong Kong Dollar
  'TWD': '🇹🇼', // Taiwan Dollar
  'THB': '🇹🇭', // Thai Baht
  'MYR': '🇲🇾', // Malaysian Ringgit
  'IDR': '🇮🇩', // Indonesian Rupiah
  'PHP': '🇵🇭', // Philippine Peso
  'VND': '🇻🇳', // Vietnamese Dong
  'PKR': '🇵🇰', // Pakistani Rupee
  'BDT': '🇧🇩', // Bangladeshi Taka
  'LKR': '🇱🇰', // Sri Lankan Rupee
  'NPR': '🇳🇵', // Nepalese Rupee
  'MMK': '🇲🇲', // Myanmar Kyat
  'KHR': '🇰🇭', // Cambodian Riel
  'LAK': '🇱🇦', // Lao Kip
  'BND': '🇧🇳', // Brunei Dollar
  'MOP': '🇲🇴', // Macanese Pataca
  'MNT': '🇲🇳', // Mongolian Tugrik
  'KZT': '🇰🇿', // Kazakhstani Tenge
  'UZS': '🇺🇿', // Uzbekistani Som
  'KGS': '🇰🇬', // Kyrgyzstani Som
  'TJS': '🇹🇯', // Tajikistani Somoni
  'TMT': '🇹🇲', // Turkmenistani Manat
  'AFN': '🇦🇫', // Afghan Afghani
  'IRR': '🇮🇷', // Iranian Rial
  'IQD': '🇮🇶', // Iraqi Dinar
  'JOD': '🇯🇴', // Jordanian Dinar
  'LBP': '🇱🇧', // Lebanese Pound
  'SYP': '🇸🇾', // Syrian Pound
  'YER': '🇾🇪', // Yemeni Rial
  'OMR': '🇴🇲', // Omani Rial
  'QAR': '🇶🇦', // Qatari Riyal
  'SAR': '🇸🇦', // Saudi Riyal
  'AED': '🇦🇪', // UAE Dirham
  'BHD': '🇧🇭', // Bahraini Dinar
  'KWD': '🇰🇼', // Kuwaiti Dinar
  'ILS': '🇮🇱', // Israeli Shekel
  'TRY': '🇹🇷', // Turkish Lira
  
  // European Currencies
  'SEK': '🇸🇪', // Swedish Krona
  'NOK': '🇳🇴', // Norwegian Krone
  'DKK': '🇩🇰', // Danish Krone
  'PLN': '🇵🇱', // Polish Zloty
  'CZK': '🇨🇿', // Czech Koruna
  'HUF': '🇭🇺', // Hungarian Forint
  'RON': '🇷🇴', // Romanian Leu
  'BGN': '🇧🇬', // Bulgarian Lev
  'HRK': '🇭🇷', // Croatian Kuna
  'RSD': '🇷🇸', // Serbian Dinar
  'MKD': '🇲🇰', // Macedonian Denar
  'ALL': '🇦🇱', // Albanian Lek
  'BAM': '🇧🇦', // Bosnia and Herzegovina Convertible Mark
  'ISK': '🇮🇸', // Icelandic Krona
  'UAH': '🇺🇦', // Ukrainian Hryvnia
  'BYN': '🇧🇾', // Belarusian Ruble
  'MDL': '🇲🇩', // Moldovan Leu
  'GEL': '🇬🇪', // Georgian Lari
  'AMD': '🇦🇲', // Armenian Dram
  'AZN': '🇦🇿', // Azerbaijani Manat
  'RUB': '🇷🇺', // Russian Ruble
  
  // South American Currencies
  'BRL': '🇧🇷', // Brazilian Real
  'ARS': '🇦🇷', // Argentine Peso
  'CLP': '🇨🇱', // Chilean Peso
  'COP': '🇨🇴', // Colombian Peso
  'PEN': '🇵🇪', // Peruvian Sol
  'UYU': '🇺🇾', // Uruguayan Peso
  'PYG': '🇵🇾', // Paraguayan Guarani
  'BOB': '🇧🇴', // Bolivian Boliviano
  'VES': '🇻🇪', // Venezuelan Bolívar
  'GYD': '🇬🇾', // Guyanese Dollar
  'SRD': '🇸🇷', // Surinamese Dollar
  'TTD': '🇹🇹', // Trinidad and Tobago Dollar
  'BBD': '🇧🇧', // Barbadian Dollar
  'JMD': '🇯🇲', // Jamaican Dollar
  'BZD': '🇧🇿', // Belize Dollar
  'GTQ': '🇬🇹', // Guatemalan Quetzal
  'HNL': '🇭🇳', // Honduran Lempira
  'NIO': '🇳🇮', // Nicaraguan Córdoba
  'CRC': '🇨🇷', // Costa Rican Colón
  'PAB': '🇵🇦', // Panamanian Balboa
  'DOP': '🇩🇴', // Dominican Peso
  'HTG': '🇭🇹', // Haitian Gourde
  'CUP': '🇨🇺', // Cuban Peso
  
  // North American Currencies
  'MXN': '🇲🇽', // Mexican Peso
  
  // Pacific Currencies
  'FJD': '🇫🇯', // Fijian Dollar
  'PGK': '🇵🇬', // Papua New Guinean Kina
  'SBD': '🇸🇧', // Solomon Islands Dollar
  'VUV': '🇻🇺', // Vanuatu Vatu
  'WST': '🇼🇸', // Samoan Tala
  'TOP': '🇹🇴', // Tongan Paʻanga
  'XPF': '🇵🇫', // CFP Franc (French Pacific)
  
  
  // Other Currencies
  'XDR': '🌍', // Special Drawing Rights (IMF)
  'XAU': '🥇', // Gold
  'XAG': '🥈', // Silver
  'XPT': '🥉', // Platinum
  'XPD': '💎', // Palladium
}

/**
 * Get the country flag emoji for a given currency code
 * @param currencyCode - The 3-letter currency code (e.g., 'USD', 'NGN')
 * @returns The corresponding flag emoji or a default world emoji
 */
export const getCountryFlag = (currencyCode: string): string => {
  if (!currencyCode) return '🌍'
  
  const normalizedCode = currencyCode.toUpperCase()
  return CURRENCY_FLAG_MAP[normalizedCode] || '🌍'
}

/**
 * Get all available currency codes with their flags
 * @returns Array of objects with currency code and flag
 */
export const getAllCurrencyFlags = (): Array<{ code: string; flag: string }> => {
  return Object.entries(CURRENCY_FLAG_MAP).map(([code, flag]) => ({
    code,
    flag
  }))
}

/**
 * Check if a currency code has a flag mapping
 * @param currencyCode - The currency code to check
 * @returns True if the currency has a flag mapping
 */
export const hasFlagMapping = (currencyCode: string): boolean => {
  const normalizedCode = currencyCode.toUpperCase()
  return normalizedCode in CURRENCY_FLAG_MAP
}
