/**
 * Country-specific proof of address document types
 * Defines which document types are acceptable for each country
 */

export type AddressDocumentType = 
  | 'utility_bill' 
  | 'bank_statement' 
  | 'lease_agreement'

export interface DocumentTypeOption {
  value: AddressDocumentType
  label: string
}

/**
 * Country-specific document type requirements
 * Some countries may not accept all document types
 */
export const countryDocumentTypes: Record<string, AddressDocumentType[]> = {
  // United States
  US: ['utility_bill', 'bank_statement', 'lease_agreement'],
  
  // Canada
  CA: ['utility_bill', 'bank_statement', 'lease_agreement'],
  
  // United Kingdom
  GB: ['utility_bill', 'bank_statement', 'lease_agreement'],
  
  // Most EEA countries
  DE: ['utility_bill', 'bank_statement', 'lease_agreement'],
  FR: ['utility_bill', 'bank_statement', 'lease_agreement'],
  IT: ['utility_bill', 'bank_statement', 'lease_agreement'],
  ES: ['utility_bill', 'bank_statement', 'lease_agreement'],
  NL: ['utility_bill', 'bank_statement', 'lease_agreement'],
  BE: ['utility_bill', 'bank_statement', 'lease_agreement'],
  CH: ['utility_bill', 'bank_statement', 'lease_agreement'],
  AT: ['utility_bill', 'bank_statement', 'lease_agreement'],
  SE: ['utility_bill', 'bank_statement', 'lease_agreement'],
  NO: ['utility_bill', 'bank_statement', 'lease_agreement'],
  DK: ['utility_bill', 'bank_statement', 'lease_agreement'],
  FI: ['utility_bill', 'bank_statement', 'lease_agreement'],
  IE: ['utility_bill', 'bank_statement', 'lease_agreement'],
  PT: ['utility_bill', 'bank_statement', 'lease_agreement'],
  PL: ['utility_bill', 'bank_statement', 'lease_agreement'],
  GR: ['utility_bill', 'bank_statement', 'lease_agreement'],
  RO: ['utility_bill', 'bank_statement', 'lease_agreement'],
  CZ: ['utility_bill', 'bank_statement', 'lease_agreement'],
  HU: ['utility_bill', 'bank_statement', 'lease_agreement'],
  BG: ['utility_bill', 'bank_statement', 'lease_agreement'],
  HR: ['utility_bill', 'bank_statement', 'lease_agreement'],
  SI: ['utility_bill', 'bank_statement', 'lease_agreement'],
  SK: ['utility_bill', 'bank_statement', 'lease_agreement'],
  LT: ['utility_bill', 'bank_statement', 'lease_agreement'],
  LV: ['utility_bill', 'bank_statement', 'lease_agreement'],
  EE: ['utility_bill', 'bank_statement', 'lease_agreement'],
  MT: ['utility_bill', 'bank_statement', 'lease_agreement'],
  CY: ['utility_bill', 'bank_statement', 'lease_agreement'],
  LU: ['utility_bill', 'bank_statement', 'lease_agreement'],
  IS: ['utility_bill', 'bank_statement', 'lease_agreement'],
}

const documentTypeLabels: Record<AddressDocumentType, string> = {
  utility_bill: 'Utility Bill',
  bank_statement: 'Bank Statement',
  lease_agreement: 'Residential Lease Agreement',
}

/**
 * Get available document types for a country
 * Returns all types if country not found (default to most permissive)
 */
export function getDocumentTypesForCountry(countryCode: string): DocumentTypeOption[] {
  const types = countryDocumentTypes[countryCode] || [
    'utility_bill',
    'bank_statement',
    'lease_agreement',
  ]
  
  return types.map(type => ({
    value: type,
    label: documentTypeLabels[type],
  }))
}

