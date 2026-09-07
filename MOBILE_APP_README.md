# Bloom Budget - React Native Mobile App

## 📱 This is the REAL Mobile App Version

Located in `/mobile-app/` directory - runs on iOS and Android devices.

## Quick Start

### Prerequisites
- Node.js 18+
- iOS: Xcode (Mac only) or use Expo Go app
- Android: Android Studio or use Expo Go app

### Install Dependencies
```bash
cd mobile-app
npm install
```

### Run on Device

#### Option 1: Expo Go (Easiest - Recommended)
1. Install **Expo Go** app on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

#### Option 2: iOS Simulator (Mac only)
```bash
npm run ios
```

#### Option 3: Android Emulator
```bash
npm run android
```

## Features

✅ **Fully Native Mobile App**
- Runs on real iOS and Android devices
- Native SQLite database (expo-sqlite)
- Native navigation with gestures
- Optimized for mobile performance
- Touch-optimized UI

✅ **Core Features**
- Multi-account management
- Income & expense tracking  
- Transfers between accounts
- Category system
- Transaction history
- Real-time balance updates

✅ **Offline-First**
- All data stored locally on device
- No internet required
- SQLite persistence
- Fast & reliable

## Project Structure

```
mobile-app/
├── src/
│   ├── domain/              # Models & interfaces
│   ├── infrastructure/      # SQLite repositories
│   ├── application/         # Services & business logic
│   └── presentation/        # React Native screens & components
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
└── package.json          # Dependencies
```

## Technology Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo SQLite** - Native database
- **React Navigation** - Native navigation

## Building for Production

### iOS (Mac only)
```bash
npm install -g eas-cli
eas build --platform ios
```

### Android
```bash
npm install -g eas-cli
eas build --platform android
```

## vs Web App

The `/app/` directory contains a web version (for reference).  
**Use `/mobile-app/` for the actual mobile application.**

---

**Status: 🚧 In Development**  
Building native mobile screens...
