# 🌸 Bloom Budget

A beautiful, fast, and intuitive mobile budget tracking app built with React Native and Expo. Track your finances across multiple wallets with a delightful pink-themed UI.

## ✨ Features

### 💰 Multi-Wallet Management
- **Multiple Accounts**: Manage unlimited bank accounts, e-wallets, cash, and credit cards
- **Custom Wallet Cards**: Each wallet displays with beautiful gradient designs
- **Institution Support**: BDO, BPI, GCash, Maya, and more
- **Multi-Currency**: Support for PHP (₱), USD ($), and JPY (¥)
- **Real-time Balance**: See your total balance across all wallets at a glance

### 📊 Transaction Tracking
- **Income & Expense Logging**: Track all your money movements
- **Category Icons**: Visual categorization (Dining, Transport, Shopping, Bills, etc.)
- **Transfer Between Wallets**: Move money between accounts seamlessly
- **Transaction History**: View recent transactions with dates and amounts
- **Quick Stats**: See total income vs expenses instantly

### 🔔 Smart Reminders & Notifications
- **Bill Due Reminders**: Set up recurring payment reminders
- **Dual Notifications**: 
  - **Advance Notice**: Get notified 2 days before at 9:00 AM
  - **Due Date Alert**: Get notified on the due date at 9:00 AM
- **Snooze Functionality**: Postpone reminders for 3 days with one tap
- **Auto-Renewal Tracking**: Mark bills as auto-renew
- **Payment Status**: Mark reminders as paid to track commitments
- **Category Filters**: Filter by subscriptions, utilities, rent, lifestyle
- **Smart Hiding**: Snoozed reminders automatically hide until snooze expires

### 🔒 Security & Authentication
- **4-Digit PIN**: Simple and secure PIN-based authentication
- **Biometric Lock**: Face ID / Fingerprint support
- **Auto-Lock**: Requires authentication when reopening app
- **First-Time Setup**: Guided setup for new users (name → PIN → biometric)
- **No Cloud Dependencies**: All data stored locally and privately

### 🎨 Beautiful Design
- **Pink Theme**: Soft, modern pink gradient design (#FF6B9D)
- **Dark Mode**: Easy on the eyes with automatic dark theme
- **Smooth Animations**: Delightful micro-interactions throughout
- **Custom Fonts**: Poppins font family for clean typography
- **Responsive Cards**: Touch-optimized interface with haptic feedback
- **Loading Skeletons**: Smooth loading states during app initialization

### 🎯 User Experience
- **Interactive Onboarding**: 4-screen introduction for new users
- **Guided Tour**: In-app guide highlighting key features
- **Quick Actions**: Tap stats pills to add transactions quickly
- **Swipe Gestures**: Horizontal scrolling for wallet cards
- **Keyboard Handling**: Smart keyboard avoidance and scroll support
- **Settings Reset**: Triple-tap logo to reset app (for development)

---

## 🚀 Performance

### ⚡ Lightning Fast
- **Instant Load**: App ready in under 1 second on modern devices
- **No Network Calls**: Zero API dependencies = zero lag
- **Local-First**: All data stored in AsyncStorage for instant access
- **Optimized Rendering**: Efficient React Native component architecture
- **60 FPS Animations**: Smooth Animated API for all transitions
- **Small Bundle**: Minimal dependencies keep the APK under 50MB

### 🔋 Battery Friendly
- **No Background Sync**: Only scheduled notifications run in background
- **Efficient Storage**: Minimal disk I/O with batched saves
- **No Tracking**: Zero analytics or telemetry = zero battery drain

### 📱 Offline-First
- **100% Offline**: Works perfectly without internet connection
- **Local Notifications**: All reminders scheduled locally
- **No Auth Servers**: PIN and biometric handled on-device
- **Data Privacy**: Your financial data never leaves your phone

---

## 📦 Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage
- **Authentication**: Expo Local Authentication
- **Notifications**: Expo Notifications
- **Build**: EAS Build (Production APK)

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- For building: EAS CLI (`npm install -g eas-cli`)

### Development Setup

```bash
# Clone the repository
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Building for Production

```bash
# Login to Expo
eas login

# Configure build (first time only)
eas build:configure

# Build production APK
eas build --profile production --platform android

# Build for iOS
eas build --profile production --platform ios
```

---

## 📱 Download

### Android
Download the latest APK from [Expo Builds](https://expo.dev/accounts/clowwyn/projects/bloom-budget/builds)

### iOS
Coming soon to TestFlight

---

## 🎮 Usage Guide

### First Time Setup
1. Open app → Enter your full name
2. Create a 4-digit PIN
3. (Optional) Enable biometric authentication
4. Complete onboarding tour

### Adding a Wallet
1. Tap "Add Wallet" on dashboard
2. Enter wallet name and balance
3. Select wallet type (Bank, E-wallet, Cash, Credit, Debit)
4. Choose institution
5. Pick a color (or use gradient presets)
6. Tap "Add Wallet"

### Logging Transactions
1. Tap "Add Transaction" or tap Income/Expense pills
2. Select type (Income, Expense, Transfer)
3. Choose category and wallet
4. Enter amount and description
5. Tap "Add Transaction"

### Setting Up Bill Reminders
1. Go to Reminders tab
2. Tap "Add Reminder"
3. Enter bill details:
   - Name (e.g., "Netflix Subscription")
   - Amount
   - Due date
   - Category
   - Payment account
4. Enable auto-renew if applicable
5. Choose icon
6. Tap "Add Reminder"

### Managing Notifications
1. Go to Settings
2. Toggle "Bill Due Notifications" on/off
3. (Optional) Enable "Daily Log Reminder" for 8:30 PM reminders

---

## 🔐 Privacy & Security

- **Zero Data Collection**: No analytics, no tracking, no telemetry
- **Local Storage Only**: All data stays on your device
- **No Account Required**: No email, no password, no cloud sync
- **Biometric Protection**: Optional Face ID / Fingerprint lock
- **Open Source Ready**: Clean codebase for transparency

---

## 🐛 Troubleshooting

### Notifications Not Working
1. Check Settings → Enable "Bill Due Notifications"
2. Grant notification permissions in phone settings
3. Ensure reminders have future due dates

### Biometric Not Working
1. Ensure your device has biometric hardware
2. Check that biometric is enrolled in device settings
3. Re-enable in app Settings

### App Reset (Development)
1. Triple-tap the Bloom Budget logo on dashboard
2. Confirm reset
3. App will clear all data and restart

---

## 📄 License

MIT License - Feel free to use, modify, and distribute

---

## 🙏 Credits

- **Icons**: Lucide Icons
- **Fonts**: Poppins (Google Fonts)
- **Design**: Custom pink gradient theme
- **Built with**: Expo & React Native

---

## 📞 Support

For issues or feature requests:
- Check existing documentation
- Review code in `App.tsx`
- Build issues: Check EAS Build logs

---

## 🎯 Roadmap

### Coming Soon
- [ ] Export data to CSV
- [ ] Budget goals and limits
- [ ] Recurring transaction templates
- [ ] Charts and analytics
- [ ] Multiple currency wallets
- [ ] Backup/Restore via QR code
- [ ] Widget support

### Future Considerations
- [ ] Cloud sync (optional)
- [ ] Shared wallets (family mode)
- [ ] Receipt photo attachments
- [ ] AI-powered categorization

---

**Made with 💖 by developers who care about your privacy and your money**

*Version 1.0.0 | Build 5*
