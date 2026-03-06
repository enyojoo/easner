/**
 * KYB (Know Your Business) field requirements by country.
 * Based on regulatory requirements: business registries, tax authorities, and AML/KYC frameworks.
 *
 * USA: EIN from IRS (9-digit federal tax ID)
 * UK: Companies House registration number
 * Nigeria: CAC (Corporate Affairs Commission) registration/RC number
 * Estonia: Registry code (8-digit, serves as both registration and tax ID)
 * Canada: Business Number (BN) from CRA (9-digit)
 * Most countries: Registration number + Tax ID/VAT (generic)
 */
export interface KybField {
  id: string
  label: string
  placeholder?: string
}

export const KYB_BY_COUNTRY: Record<string, KybField[]> = {
  US: [
    { id: "taxId", label: "EIN (Employer Identification Number)", placeholder: "12-3456789" },
  ],
  GB: [
    { id: "registrationNumber", label: "Companies House registration number", placeholder: "e.g. 12345678" },
  ],
  NG: [
    { id: "registrationNumber", label: "CAC registration number (RC number)", placeholder: "From Corporate Affairs Commission" },
  ],
  EE: [
    { id: "registrationNumber", label: "Registry code (registrikood)", placeholder: "8-digit code from e-Business Register" },
  ],
  CA: [
    { id: "registrationNumber", label: "Business Number (BN)", placeholder: "9-digit CRA identifier" },
  ],
}

/** Default fields for countries not explicitly listed - most jurisdictions require registration + tax ID */
export const KYB_DEFAULT: KybField[] = [
  { id: "registrationNumber", label: "Business registration number", placeholder: "From company registry" },
  { id: "taxId", label: "Tax ID / VAT number", placeholder: "From tax authority" },
]

export function getKybFields(countryCode: string): KybField[] {
  return KYB_BY_COUNTRY[countryCode] ?? KYB_DEFAULT
}
