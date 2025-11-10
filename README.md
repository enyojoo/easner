# Easner - Invisible Stablecoin Cross-Border Payment Infrastructure

Easner is building invisible stablecoin cross-border payment infrastructure that makes sending money as seamless as a domestic transfer. We combine fiat banking rails with Stellar's stablecoin network and AI-powered compliance to deliver instant, zero-fee, and trusted payments.

## Core Value Proposition

- ⚡ **Instant Transfers**: Send money globally like a domestic transfer
- 💰 **Zero Fees**: No hidden costs, no surprise charges
- 🛡️ **Bank-Level Security**: Enterprise-grade security and compliance
- 🌍 **Global Reach**: Send to 150+ countries with competitive exchange rates
- 🤖 **AI-Powered Compliance**: Automated compliance checks for seamless transactions
- 🏦 **B2B API**: Integration-ready for fintechs, banks, and e-commerce platforms

## Features

- 🌍 **Cross-Border Payments**: Send money between supported currencies with zero fees
- 💱 **Real-time Exchange Rates**: Live currency conversion with competitive rates
- 👥 **User Management**: Complete user registration, authentication, and profile management
- 🛡️ **Admin Dashboard**: Comprehensive admin panel for managing transactions, users, and rates
- 📱 **Mobile Responsive**: Optimized for all devices with dedicated mobile app
- 🔒 **Secure**: Built with security best practices and Supabase Auth
- 📊 **Analytics**: Integrated with PostHog for user behavior tracking
- 🚀 **Stellar Integration**: Leveraging Stellar's stablecoin network for fast, low-cost transfers

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components, Unbounded & Poppins fonts
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Analytics**: PostHog
- **Blockchain**: Stellar Network for stablecoin infrastructure
- **Mobile**: React Native with Expo (separate mobile app)
- **Deployment**: Vercel (web), EAS Build (mobile)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- PostHog account (optional)

### Environment Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd easner
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create environment variables file and configure:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostHog Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SendGrid Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=YourAppName
SENDGRID_REPLY_TO=support@yourdomain.com
```

### Development

Start the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mobile App Development

The project includes a separate React Native mobile app built with Expo:

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install mobile dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npx expo start --clear
```

4. Build for production:
```bash
# Android
eas build --platform android --profile production

# iOS  
eas build --platform ios --profile production
```

## Next Steps for Development

1. **Stellar Integration**: Implement Stellar network integration for stablecoin transfers
2. **AI Compliance**: Build AI-powered compliance checking system
3. **B2B API**: Develop API endpoints for fintech and bank integrations
4. **Database Setup**: Create required Supabase tables and RLS policies
5. **Testing**: Implement unit and integration tests
6. **Rate Limiting**: Add API rate limiting for security
7. **Monitoring**: Set up error tracking (Sentry) and performance monitoring
8. **File Upload**: Configure Supabase Storage for receipt uploads
9. **Mobile App**: Complete React Native mobile app development
10. **Production Deployment**: Deploy to production with proper CI/CD pipeline

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── user/              # User dashboard pages
│   ├── auth/              # Authentication pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components
│   ├── auth/              # Authentication components
│   ├── brand/             # Brand-specific components
│   └── error-boundary.tsx # Global error handling
├── mobile/                # React Native mobile app
│   ├── src/               # Mobile app source code
│   ├── App.tsx            # Mobile app entry point
│   └── package.json       # Mobile dependencies
├── lib/                   # Utility functions and configurations
│   ├── auth-context.tsx   # Authentication context
│   ├── auth-utils.ts      # Authentication utilities
│   ├── database.ts        # Database service functions
│   ├── supabase.ts        # Supabase client configuration
│   ├── posthog.ts         # Analytics configuration
│   └── cache.ts           # Caching system
├── types/                 # TypeScript type definitions
├── email-templates/       # Email template files
└── public/                # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support, create an issue in this repository.