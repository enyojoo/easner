# Easner - International Money Transfer Platform

A modern, secure money transfer application built with Next.js, TypeScript, and Supabase.

## Features

- 🌍 **International Money Transfers**: Send money between supported currencies
- 💱 **Real-time Exchange Rates**: Live currency conversion with competitive rates
- 👥 **User Management**: Complete user registration, authentication, and profile management
- 🛡️ **Admin Dashboard**: Comprehensive admin panel for managing transactions, users, and rates
- 📱 **Mobile Responsive**: Optimized for all devices
- 🔒 **Secure**: Built with security best practices and Supabase Auth
- 📊 **Analytics**: Integrated with PostHog for user behavior tracking

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Analytics**: PostHog
- **Deployment**: Vercel (recommended)

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
SENDGRID_FROM_EMAIL=noreply@easner.com
SENDGRID_FROM_NAME=Easner
SENDGRID_REPLY_TO=support@easner.com
```

### Development

Start the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Recent Updates

✅ **Brand Identity Fixed**: Updated from NovaPay to Easner throughout the application
✅ **Authentication System**: Standardized on Supabase Auth, removed JWT inconsistencies  
✅ **Error Handling**: Added comprehensive error boundaries and error handling
✅ **API Security**: Improved authentication for API routes
✅ **Documentation**: Added comprehensive setup and development guide

## Next Steps for Development

1. **Database Setup**: Create required Supabase tables and RLS policies
2. **Testing**: Implement unit and integration tests
3. **Rate Limiting**: Add API rate limiting for security
4. **Monitoring**: Set up error tracking (Sentry) and performance monitoring
5. **File Upload**: Configure Supabase Storage for receipt uploads

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── user/              # User dashboard pages
│   └── (auth)/            # Authentication pages
├── components/            # Reusable React components
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components
│   ├── error-boundary.tsx # Global error handling
│   └── brand/             # Brand-specific components
├── lib/                   # Utility functions and configurations
│   ├── auth-context.tsx   # Authentication context
│   ├── auth-utils.ts      # Authentication utilities
│   ├── database.ts        # Database service functions
│   ├── supabase.ts        # Supabase client configuration
│   └── cache.ts           # Caching system
├── types/                 # TypeScript type definitions
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