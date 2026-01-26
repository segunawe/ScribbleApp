# ScribbleApp - EAS Deployment Guide

This guide will help you deploy ScribbleApp to iOS and Android app stores using Expo Application Services (EAS).

## Prerequisites

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Create an Expo account:**
   - Sign up at https://expo.dev
   - Run `eas login` to authenticate

3. **For iOS deployment:**
   - Apple Developer Account ($99/year)
   - Apple Team ID and Apple ID

4. **For Android deployment:**
   - Google Play Developer Account ($25 one-time fee)
   - Google Play Service Account JSON key

## Initial Setup

### 1. Configure Your EAS Project

```bash
# Initialize EAS in your project (if not already done)
eas build:configure
```

### 2. Update Bundle Identifiers

If you need to change the bundle identifiers from `com.scribbleapp.ScribbleApp`:

1. Open `app.json`
2. Update `expo.ios.bundleIdentifier`
3. Update `expo.android.package`
4. Ensure these match your app store registrations

### 3. Set Up iOS Credentials

```bash
# EAS will guide you through setting up credentials
eas credentials
```

You'll need:
- Apple Team ID
- Apple ID (email)
- App Store Connect App ID (get this after creating your app in App Store Connect)

Update these values in `eas.json` under `submit.production.ios`.

### 4. Set Up Android Credentials

1. **Create a Google Play Service Account:**
   - Go to Google Play Console > Setup > API access
   - Create a service account
   - Download the JSON key file
   - Save it as `service-account.json` in your project root (it's gitignored)

2. **Create your app in Google Play Console:**
   - Create a new app
   - Fill in required store listing information

## Building Your App

### Preview Builds (for testing)

**Android APK:**
```bash
npm run build:preview:android
# or
eas build --platform android --profile preview
```

**iOS (TestFlight):**
```bash
npm run build:preview:ios
# or
eas build --platform ios --profile preview
```

### Production Builds

**Android App Bundle (for Play Store):**
```bash
npm run build:production:android
# or
eas build --platform android --profile production
```

**iOS (for App Store):**
```bash
npm run build:production:ios
# or
eas build --platform ios --profile production
```

**Both platforms:**
```bash
npm run build:production:all
# or
eas build --platform all --profile production
```

## Submitting to App Stores

### Submit to Google Play Store

```bash
npm run submit:android
# or
eas submit --platform android
```

The build will be submitted to the internal testing track. You can promote it to other tracks (alpha, beta, production) in the Google Play Console.

### Submit to Apple App Store

```bash
npm run submit:ios
# or
eas submit --platform ios
```

The build will be submitted to App Store Connect. You'll need to:
1. Complete app metadata in App Store Connect
2. Set up screenshots
3. Submit for App Review

## Build Profiles Explained

- **development**: Creates a development client for testing with hot reload
- **preview**: Creates an APK/IPA for internal testing (no store submission)
- **production**: Creates optimized builds ready for app store submission

## Updating Your App

1. Update version numbers:
   - In `app.json`: increment `expo.version`
   - In `package.json`: increment `version`
   - Build numbers are auto-incremented by EAS

2. Build a new production version:
   ```bash
   npm run build:production:all
   ```

3. Submit to stores:
   ```bash
   npm run submit:android
   npm run submit:ios
   ```

## Troubleshooting

### Build Fails

- Check your credentials: `eas credentials`
- Review build logs in the EAS dashboard
- Ensure all assets referenced in `app.json` exist

### Submission Fails

**Android:**
- Verify service account has proper permissions in Google Play Console
- Ensure app exists in Google Play Console
- Check that version code is higher than previous releases

**iOS:**
- Verify Apple ID and Team ID in `eas.json`
- Ensure app exists in App Store Connect
- Check that build number is higher than previous submissions

## Monitoring Builds

- View build progress: https://expo.dev/accounts/[your-account]/projects/ScribbleApp/builds
- Build logs are available in the EAS dashboard
- You'll receive email notifications when builds complete

## Store Listing Requirements

Before submitting to stores, prepare:

- App description (short and long)
- Screenshots (various device sizes)
- App icon (already configured)
- Privacy policy (if collecting user data)
- Content rating information
- Support contact information

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
