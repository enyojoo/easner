# Easner Mobile App Deployment Guide

This guide covers how to build and deploy the Easner mobile app to both Android and iOS app stores.

## Prerequisites

1. **Expo CLI**: Install globally
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Expo Account**: Create an account at [expo.dev](https://expo.dev)

3. **Apple Developer Account**: For iOS deployment
4. **Google Play Console Account**: For Android deployment

## Environment Setup

1. **Login to Expo**:
   ```bash
   eas login
   ```

2. **Configure Project**:
   ```bash
   eas build:configure
   ```

3. **Set Environment Variables**:
   Create a `.env` file in the mobile directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

## Building the App

### Development Build
```bash
# For testing on physical devices
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Preview Build
```bash
# For internal testing
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

### Production Build
```bash
# For app store submission
eas build --profile production --platform android
eas build --profile production --platform ios
```

## App Store Configuration

### iOS App Store

1. **App Store Connect Setup**:
   - Create a new app in App Store Connect
   - Set bundle identifier: `com.easner.mobile`
   - Configure app information, screenshots, and metadata

2. **Build and Submit**:
   ```bash
   eas build --profile production --platform ios
   eas submit --platform ios
   ```

3. **Required Assets**:
   - App icon (1024x1024)
   - Screenshots for different device sizes
   - App description and keywords

### Google Play Store

1. **Play Console Setup**:
   - Create a new app in Google Play Console
   - Set package name: `com.easner.mobile`
   - Configure app information and store listing

2. **Build and Submit**:
   ```bash
   eas build --profile production --platform android
   eas submit --platform android
   ```

3. **Required Assets**:
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots for different device sizes
   - App description and short description

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/mobile-build.yml`:

```yaml
name: Mobile Build
on:
  push:
    branches: [main]
    paths: ['mobile/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd mobile
          npm install
      - name: Build Android
        run: |
          cd mobile
          eas build --platform android --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      - name: Build iOS
        run: |
          cd mobile
          eas build --platform ios --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Testing

### Local Development
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Testing on Physical Devices
1. Install Expo Go app on your device
2. Scan the QR code from `npm start`
3. Or install development builds for full functionality

## Monitoring and Analytics

### Expo Analytics
- Built-in analytics through Expo
- Track app usage and crashes
- Monitor performance metrics

### Custom Analytics
- Integrate with PostHog (already configured)
- Track user interactions and events
- Monitor conversion rates

## Security Considerations

1. **API Keys**: Never commit sensitive keys to version control
2. **Code Signing**: Use proper certificates for app signing
3. **App Transport Security**: Configure ATS for iOS
4. **Permissions**: Request only necessary permissions

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables
   - Verify app.json configuration
   - Check for missing dependencies

2. **Submission Issues**:
   - Ensure all required metadata is provided
   - Check app store guidelines compliance
   - Verify app signing certificates

3. **Runtime Errors**:
   - Check Supabase configuration
   - Verify network connectivity
   - Review error logs in Expo dashboard

### Getting Help

- Expo Documentation: [docs.expo.dev](https://docs.expo.dev)
- Expo Discord: [discord.gg/expo](https://discord.gg/expo)
- GitHub Issues: Create issues in the project repository

## Release Management

### Versioning
- Follow semantic versioning (e.g., 1.0.0)
- Update version in `app.json`
- Tag releases in Git

### Release Notes
- Document new features and bug fixes
- Include breaking changes
- Provide migration guides if needed

### Rollback Plan
- Keep previous app versions available
- Monitor app store reviews and ratings
- Have rollback procedures ready

## Performance Optimization

### Bundle Size
- Use tree shaking to remove unused code
- Optimize images and assets
- Minimize dependencies

### Runtime Performance
- Use React.memo for expensive components
- Implement lazy loading where appropriate
- Optimize list rendering with FlatList

### Memory Management
- Clean up subscriptions and timers
- Avoid memory leaks in useEffect
- Monitor memory usage in development

## Maintenance

### Regular Updates
- Keep dependencies up to date
- Monitor security vulnerabilities
- Update app store listings

### Monitoring
- Track app performance metrics
- Monitor crash reports
- Review user feedback

### Backup
- Keep source code in version control
- Backup app store assets
- Document configuration changes
