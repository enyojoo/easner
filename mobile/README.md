# Easner Mobile App

A React Native mobile application built with Expo for the Easner money transfer platform.

## Features

- User authentication (login, register, password reset)
- Send money with currency conversion
- Recipient management
- Transaction history
- User profile management
- Support center

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: React Navigation
- **Backend**: Supabase (shared with web app)
- **State Management**: React Context
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` and add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. Start the development server:
```bash
npm start
```

4. Run on specific platforms:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── navigation/         # Navigation configuration
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── main/          # Main app screens
│   ├── send/          # Send money flow screens
│   └── transactions/  # Transaction-related screens
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Development

### Adding New Screens

1. Create the screen component in the appropriate directory
2. Add the screen to the navigation stack in `src/navigation/AppNavigator.tsx`
3. Update the types if needed

### State Management

The app uses React Context for state management:
- `AuthContext`: Handles user authentication
- `UserDataContext`: Manages user data and API calls

### API Integration

The app connects to the same Supabase backend as the web application, sharing:
- User authentication
- Database tables
- Real-time subscriptions

## Building for Production

### Using EAS Build

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure the project:
```bash
eas build:configure
```

4. Build for platforms:
```bash
# Android
npm run build:android

# iOS
npm run build:ios

# Both platforms
npm run build:all
```

### App Store Submission

```bash
# Android (Google Play)
npm run submit:android

# iOS (App Store)
npm run submit:ios
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow React Native best practices
4. Test on both iOS and Android platforms

## License

Private - Easner Platform
