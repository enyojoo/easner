import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import { earlyAccessService } from '@/lib/early-access-service'

interface EarlyAccessFormData {
  email: string
  fullName: string
  whatsappTelegram: string
  primaryUseCase: string
  locatedIn: string
  sendingTo: string
}

// Function to get client IP address from various headers
function getClientIP(request: NextRequest): string {
  // Check various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  const xClientIP = request.headers.get('x-client-ip')
  const xForwarded = request.headers.get('x-forwarded')
  const forwarded = request.headers.get('forwarded')
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    const firstIP = ips[0]
    // Filter out common proxy/local IPs
    if (firstIP && firstIP !== '127.0.0.1' && firstIP !== '::1' && firstIP !== '1' && !firstIP.startsWith('192.168.') && !firstIP.startsWith('10.')) {
      return firstIP
    }
  }
  
  // Check other headers
  if (realIP && realIP !== '127.0.0.1' && realIP !== '::1' && realIP !== '1') return realIP
  if (cfConnectingIP && cfConnectingIP !== '127.0.0.1' && cfConnectingIP !== '::1' && cfConnectingIP !== '1') return cfConnectingIP
  if (xClientIP && xClientIP !== '127.0.0.1' && xClientIP !== '::1' && xClientIP !== '1') return xClientIP
  if (xForwarded && xForwarded !== '127.0.0.1' && xForwarded !== '::1' && xForwarded !== '1') return xForwarded
  if (forwarded && forwarded !== '127.0.0.1' && forwarded !== '::1' && forwarded !== '1') return forwarded
  
  // For local development, return a more descriptive message
  if (process.env.NODE_ENV === 'development') {
    return 'Local Development Environment'
  }
  
  // Fallback to connection remote address
  const connection = (request as any).connection?.remoteAddress
  if (connection && connection !== '127.0.0.1' && connection !== '::1' && connection !== '1') {
    return connection
  }
  
  // Last resort
  return 'Unknown'
}

export async function POST(request: NextRequest) {
  try {
    const formData: EarlyAccessFormData = await request.json()
    
    // Validate required fields
    const { email, fullName, whatsappTelegram, primaryUseCase, locatedIn, sendingTo } = formData
    
    if (!email || !fullName || !whatsappTelegram || !primaryUseCase || !locatedIn || !sendingTo) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get use case display name
    const getUseCaseName = (value: string) => {
      const useCases: { [key: string]: string } = {
        'family-remittances': 'Family remittances',
        'business-payments': 'Business payments',
        'education-payments': 'Education payments',
        'ecommerce': 'E-commerce',
        'investment-portfolio': 'Investment/Portfolio management',
        'api-integration': 'API integration'
      }
      return useCases[value] || value
    }

    // Get country names from codes
    const getCountryName = (code: string) => {
      const countries: { [key: string]: string } = {
        'US': 'United States',
        'NG': 'Nigeria',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'IT': 'Italy',
        'ES': 'Spain',
        'NL': 'Netherlands',
        'BE': 'Belgium',
        'CH': 'Switzerland',
        'AT': 'Austria',
        'SE': 'Sweden',
        'NO': 'Norway',
        'DK': 'Denmark',
        'FI': 'Finland',
        'IE': 'Ireland',
        'PT': 'Portugal',
        'GR': 'Greece',
        'PL': 'Poland',
        'CZ': 'Czech Republic',
        'HU': 'Hungary',
        'RO': 'Romania',
        'BG': 'Bulgaria',
        'HR': 'Croatia',
        'SI': 'Slovenia',
        'SK': 'Slovakia',
        'LT': 'Lithuania',
        'LV': 'Latvia',
        'EE': 'Estonia',
        'MT': 'Malta',
        'CY': 'Cyprus',
        'LU': 'Luxembourg',
        'IS': 'Iceland',
        'LI': 'Liechtenstein',
        'MC': 'Monaco',
        'SM': 'San Marino',
        'VA': 'Vatican City',
        'AD': 'Andorra',
        'JP': 'Japan',
        'KR': 'South Korea',
        'SG': 'Singapore',
        'HK': 'Hong Kong',
        'TW': 'Taiwan',
        'TH': 'Thailand',
        'MY': 'Malaysia',
        'ID': 'Indonesia',
        'PH': 'Philippines',
        'VN': 'Vietnam',
        'IN': 'India',
        'PK': 'Pakistan',
        'BD': 'Bangladesh',
        'LK': 'Sri Lanka',
        'NP': 'Nepal',
        'BT': 'Bhutan',
        'MV': 'Maldives',
        'AF': 'Afghanistan',
        'IR': 'Iran',
        'IQ': 'Iraq',
        'IL': 'Israel',
        'JO': 'Jordan',
        'LB': 'Lebanon',
        'SY': 'Syria',
        'TR': 'Turkey',
        'SA': 'Saudi Arabia',
        'AE': 'United Arab Emirates',
        'QA': 'Qatar',
        'KW': 'Kuwait',
        'BH': 'Bahrain',
        'OM': 'Oman',
        'YE': 'Yemen',
        'EG': 'Egypt',
        'LY': 'Libya',
        'TN': 'Tunisia',
        'DZ': 'Algeria',
        'MA': 'Morocco',
        'SD': 'Sudan',
        'ET': 'Ethiopia',
        'KE': 'Kenya',
        'UG': 'Uganda',
        'TZ': 'Tanzania',
        'RW': 'Rwanda',
        'BI': 'Burundi',
        'DJ': 'Djibouti',
        'SO': 'Somalia',
        'ER': 'Eritrea',
        'SS': 'South Sudan',
        'CF': 'Central African Republic',
        'TD': 'Chad',
        'NE': 'Niger',
        'ML': 'Mali',
        'BF': 'Burkina Faso',
        'CI': 'Côte d\'Ivoire',
        'GH': 'Ghana',
        'TG': 'Togo',
        'BJ': 'Benin',
        'SN': 'Senegal',
        'GM': 'Gambia',
        'GN': 'Guinea',
        'GW': 'Guinea-Bissau',
        'SL': 'Sierra Leone',
        'LR': 'Liberia',
        'CV': 'Cape Verde',
        'ST': 'São Tomé and Príncipe',
        'GQ': 'Equatorial Guinea',
        'GA': 'Gabon',
        'CG': 'Republic of the Congo',
        'CD': 'Democratic Republic of the Congo',
        'AO': 'Angola',
        'ZM': 'Zambia',
        'ZW': 'Zimbabwe',
        'BW': 'Botswana',
        'NA': 'Namibia',
        'ZA': 'South Africa',
        'LS': 'Lesotho',
        'SZ': 'Eswatini',
        'MW': 'Malawi',
        'MZ': 'Mozambique',
        'MG': 'Madagascar',
        'MU': 'Mauritius',
        'SC': 'Seychelles',
        'KM': 'Comoros',
        'YT': 'Mayotte',
        'RE': 'Réunion',
        'SH': 'Saint Helena',
        'BR': 'Brazil',
        'AR': 'Argentina',
        'CL': 'Chile',
        'UY': 'Uruguay',
        'PY': 'Paraguay',
        'BO': 'Bolivia',
        'PE': 'Peru',
        'EC': 'Ecuador',
        'CO': 'Colombia',
        'VE': 'Venezuela',
        'GY': 'Guyana',
        'SR': 'Suriname',
        'GF': 'French Guiana',
        'FK': 'Falkland Islands',
        'GS': 'South Georgia and the South Sandwich Islands',
        'MX': 'Mexico',
        'GT': 'Guatemala',
        'BZ': 'Belize',
        'SV': 'El Salvador',
        'HN': 'Honduras',
        'NI': 'Nicaragua',
        'CR': 'Costa Rica',
        'PA': 'Panama',
        'CU': 'Cuba',
        'JM': 'Jamaica',
        'HT': 'Haiti',
        'DO': 'Dominican Republic',
        'PR': 'Puerto Rico',
        'VI': 'U.S. Virgin Islands',
        'AG': 'Antigua and Barbuda',
        'BB': 'Barbados',
        'DM': 'Dominica',
        'GD': 'Grenada',
        'KN': 'Saint Kitts and Nevis',
        'LC': 'Saint Lucia',
        'VC': 'Saint Vincent and the Grenadines',
        'TT': 'Trinidad and Tobago',
        'BS': 'Bahamas',
        'RU': 'Russia',
        'CN': 'China',
        'MN': 'Mongolia',
        'KZ': 'Kazakhstan',
        'UZ': 'Uzbekistan',
        'TM': 'Turkmenistan',
        'TJ': 'Tajikistan',
        'KG': 'Kyrgyzstan',
        'AZ': 'Azerbaijan',
        'AM': 'Armenia',
        'GE': 'Georgia',
        'BY': 'Belarus',
        'UA': 'Ukraine',
        'MD': 'Moldova',
        'AL': 'Albania',
        'MK': 'North Macedonia',
        'ME': 'Montenegro',
        'RS': 'Serbia',
        'BA': 'Bosnia and Herzegovina',
        'XK': 'Kosovo',
        'NZ': 'New Zealand',
        'FJ': 'Fiji',
        'PG': 'Papua New Guinea',
        'SB': 'Solomon Islands',
        'VU': 'Vanuatu',
        'NC': 'New Caledonia',
        'PF': 'French Polynesia',
        'WS': 'Samoa',
        'TO': 'Tonga',
        'KI': 'Kiribati',
        'TV': 'Tuvalu',
        'NR': 'Nauru',
        'PW': 'Palau',
        'FM': 'Micronesia',
        'MH': 'Marshall Islands',
        'CK': 'Cook Islands',
        'NU': 'Niue',
        'TK': 'Tokelau',
        'WF': 'Wallis and Futuna',
        'AS': 'American Samoa',
        'GU': 'Guam',
        'MP': 'Northern Mariana Islands'
      }
      return countries[code] || code
    }

    // Send email to enyo@easner.com
    const emailData = {
      to: 'enyo@easner.com',
      template: 'earlyAccessRequest',
      data: {
        email,
        fullName,
        whatsappTelegram,
        primaryUseCase: getUseCaseName(primaryUseCase),
        locatedIn: getCountryName(locatedIn),
        sendingTo: getCountryName(sendingTo),
        submittedAt: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'Unknown',
        ipAddress: getClientIP(request)
      }
    }

    // Save to database first (optional - will continue if database fails)
    let savedRequest = null
    try {
      const earlyAccessData = {
        email,
        fullName,
        whatsappTelegram,
        primaryUseCase,
        locatedIn,
        sendingTo,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      }

      savedRequest = await earlyAccessService.create(earlyAccessData)
    } catch (dbError) {
      console.error('Database save failed (continuing with email):', dbError)
      // Continue with email sending even if database fails
    }

    // Send email to admin
    const adminEmailResult = await emailService.sendEmail(emailData)

    if (!adminEmailResult.success) {
      console.error('Failed to send admin email:', adminEmailResult.error)
      return NextResponse.json(
        { error: 'Failed to submit request. Please try again.' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    const userEmailData = {
      to: email,
      template: 'earlyAccessConfirmation',
      data: {
        fullName,
        email,
        primaryUseCase: getUseCaseName(primaryUseCase),
        locatedIn: getCountryName(locatedIn),
        sendingTo: getCountryName(sendingTo),
        submittedAt: new Date().toISOString()
      }
    }

    const userEmailResult = await emailService.sendEmail(userEmailData)

    if (!userEmailResult.success) {
      console.error('Failed to send user confirmation email:', userEmailResult.error)
      // Don't fail the request if user email fails, just log it
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Early access request submitted successfully',
      requestId: savedRequest?.id || null
    })

  } catch (error) {
    console.error('Early access form submission error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      formData: { email, fullName, whatsappTelegram, primaryUseCase, locatedIn, sendingTo }
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
