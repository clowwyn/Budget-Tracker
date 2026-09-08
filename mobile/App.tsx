import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, ScrollView, TextInput, Alert, Modal, Image, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SplashScreen from 'expo-splash-screen';
import { Calendar } from 'react-native-calendars';
import { GoogleSignin } from './firebaseConfig';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  User,
  Sun,
  Bell,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Plus,
  Zap,
  Receipt,
  Edit2,
  X,
  LayoutDashboard,
  Wallet,
  BarChart3,
  Settings,
  Building2,
  CreditCard,
  Smartphone,
  HandCoins,
  ShoppingBag,
  UtensilsCrossed,
  ShoppingCart,
  Car,
  FileText,
  PartyPopper,
  Heart,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Store,
  Trash2,
  ChevronRight,
  Lock,
  Fingerprint,
  Download,
  RotateCcw,
} from 'lucide-react-native';

const auth = require('@react-native-firebase/auth').default;

interface Account {
  id: number;
  name: string;
  balance: number;
  type: 'bank' | 'wallet' | 'cash' | 'credit' | 'debit';
  institution?: string;
  color: string;
  gradient?: string[];
  lastFour?: string;
  currency?: string; // New field for currency
}

interface Transaction {
  id: number;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  accountId: number;
  merchant: string;
  date: string;
}

interface Reminder {
  id: number;
  name: string;
  amount: number;
  dueDate: string; // Full date string (YYYY-MM-DD)
  category: 'subscription' | 'utility' | 'rent' | 'lifestyle' | 'other';
  accountId: number;
  autoRenew: boolean;
  isPaid: boolean;
  paidDate?: string;
  icon: string;
}

const STORAGE_KEY_ACCOUNTS = '@bloom_budget_accounts';
const STORAGE_KEY_TRANSACTIONS = '@bloom_budget_transactions';
const STORAGE_KEY_REMINDERS = '@bloom_budget_reminders';

const categoryIcons: Record<string, any> = {
  Dining: UtensilsCrossed,
  Shopping: ShoppingBag,
  Groceries: ShoppingCart,
  Transport: Car,
  Bills: FileText,
  Fun: PartyPopper,
  Health: Heart,
  Other: MoreHorizontal,
};

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'transactions' | 'reminders' | 'settings' | 'profile'>('dashboard');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [userName, setUserName] = useState('Hey, You');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingFadeAnim] = useState(new Animated.Value(0));
  const [onboardingSlideAnim] = useState(new Animated.Value(50));
  const [resetTapCount, setResetTapCount] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  // Form states for Add Wallet
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletType, setNewWalletType] = useState<'bank' | 'wallet' | 'cash' | 'credit' | 'debit'>('bank');
  const [newWalletInstitution, setNewWalletInstitution] = useState('BDO');
  const [newWalletColor, setNewWalletColor] = useState('#FF6B9D');
  const [newWalletGradient, setNewWalletGradient] = useState<string[]>(['#FF6B9D', '#C44569']);
  const [newWalletCurrency, setNewWalletCurrency] = useState('PHP');

  // Form states for Add Transaction
  const [newTransactionAmount, setNewTransactionAmount] = useState('');
  const [newTransactionType, setNewTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [newTransactionCategory, setNewTransactionCategory] = useState('Dining');
  const [newTransactionAccount, setNewTransactionAccount] = useState<number | null>(null);
  const [newTransactionToAccount, setNewTransactionToAccount] = useState<number | null>(null);
  const [newTransactionMerchant, setNewTransactionMerchant] = useState('');

  // Form states for Add Reminder
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderName, setNewReminderName] = useState('');
  const [newReminderAmount, setNewReminderAmount] = useState('');
  const [newReminderDueDate, setNewReminderDueDate] = useState('');
  const [newReminderCategory, setNewReminderCategory] = useState<'subscription' | 'utility' | 'rent' | 'lifestyle' | 'other'>('subscription');
  const [newReminderAccount, setNewReminderAccount] = useState<number | null>(null);
  const [newReminderAutoRenew, setNewReminderAutoRenew] = useState(false);
  const [newReminderIcon, setNewReminderIcon] = useState('movie');
  const [reminderFilter, setReminderFilter] = useState<'all' | 'upcoming' | 'subscription' | 'utility'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedReminderForAction, setSelectedReminderForAction] = useState<Reminder | null>(null);
  
  // Settings states
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [billNotificationsEnabled, setBillNotificationsEnabled] = useState(true);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [primaryCurrency, setPrimaryCurrency] = useState<'PHP' | 'USD' | 'JPY'>('PHP');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Helper function to format number with commas
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    
    // Add commas
    return parseInt(numericValue).toLocaleString('en-US');
  };

  // Helper function to remove commas for storage
  const removeCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  // Helper function to format amount for display (with commas)
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await SplashScreen.preventAutoHideAsync();
      await loadFonts();
      await checkAuth();
      await loadData();
      await loadSettings();
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  };

  const checkAuth = async () => {
    const authToken = await AsyncStorage.getItem('@bloom_auth_token');
    const username = await AsyncStorage.getItem('@bloom_user_name');
    
    if (authToken) {
      // Load username first
      if (username) setUserName(username);
      
      // Check if biometric is enabled - prompt BEFORE showing dashboard
      const biometricEnabledStr = await AsyncStorage.getItem('biometricEnabled');
      if (biometricEnabledStr === 'true') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access Bloom Budget',
          fallbackLabel: 'Use passcode',
        });
        
        if (result.success) {
          // Biometric success - show dashboard
          setIsAuthenticated(true);
        } else {
          // Biometric failed - show login
          setIsAuthenticated(false);
          setShowLogin(true);
        }
      } else {
        // No biometric enabled - go straight to dashboard
        setIsAuthenticated(true);
      }
    } else {
      // No auth token - show login
      setShowLogin(true);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    // Simple demo auth - in production, use Firebase
    if (loginPassword.length >= 6) {
      const authToken = Date.now().toString();
      await AsyncStorage.setItem('@bloom_auth_token', authToken);
      await AsyncStorage.setItem('@bloom_user_email', loginEmail);
      
      const name = loginEmail.split('@')[0];
      await AsyncStorage.setItem('@bloom_user_name', name);
      setUserName(name);
      
      setIsAuthenticated(true);
      setShowLogin(false);
      
      // Check if first time user
      const hasSeenOnboarding = await AsyncStorage.getItem('@bloom_budget_onboarding_complete');
      if (!hasSeenOnboarding) {
        // First time - offer biometric setup
        const isSupported = await checkBiometricSupport();
        if (isSupported) {
          setShowBiometricSetup(true);
        } else {
          setShowOnboarding(true);
        }
      }
      
      Alert.alert('Welcome!', `Signed in as ${name}`);
    } else {
      Alert.alert('Error', 'Password must be at least 6 characters');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Sign out from Firebase
            await auth().signOut();
            // Sign out from Google
            try {
              await GoogleSignin.signOut();
            } catch (error) {
              // User might not be signed in with Google
              console.log('Google sign-out skipped');
            }
            // Clear local storage
            await AsyncStorage.removeItem('@bloom_auth_token');
            await AsyncStorage.removeItem('@bloom_user_email');
            await AsyncStorage.removeItem('@bloom_user_name');
            setIsAuthenticated(false);
            setShowLogin(true);
            setLoginEmail('');
            setLoginPassword('');
          },
        },
      ]
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      // Check if device supports Google Play services
      await GoogleSignin.hasPlayServices();
      
      // Get user info from Google
      const userInfo = await GoogleSignin.signIn();
      
      // Get Google credential
      const { idToken } = userInfo.data!;
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;
      
      // Save auth info
      const authToken = await user.getIdToken();
      await AsyncStorage.setItem('@bloom_auth_token', authToken);
      await AsyncStorage.setItem('@bloom_user_email', user.email || '');
      await AsyncStorage.setItem('@bloom_user_name', user.displayName || user.email?.split('@')[0] || 'User');
      
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      setIsAuthenticated(true);
      setShowLogin(false);
      
      // Check if first time user
      const hasSeenOnboarding = await AsyncStorage.getItem('@bloom_budget_onboarding_complete');
      if (!hasSeenOnboarding) {
        const isSupported = await checkBiometricSupport();
        if (isSupported) {
          setShowBiometricSetup(true);
        } else {
          setShowOnboarding(true);
        }
      }
      
      Alert.alert('Welcome!', `Signed in as ${user.displayName || user.email}`);
    } catch (error: any) {
      if (error.code === 'sign_in_cancelled') {
        // User cancelled the login flow
        console.log('User cancelled Google Sign-In');
      } else if (error.code === 'in_progress') {
        // Operation already in progress
        Alert.alert('Please wait', 'Sign-in already in progress');
      } else if (error.code === 'play_services_not_available') {
        Alert.alert('Error', 'Google Play Services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error);
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      }
    }
  };

  // Animate onboarding step changes
  useEffect(() => {
    if (showOnboarding) {
      Animated.parallel([
        Animated.timing(onboardingFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(onboardingSlideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [onboardingStep, showOnboarding]);

  const loadFonts = async () => {
    await Font.loadAsync({
      'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
      'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
      'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
      'JetBrainsMono-Regular': JetBrainsMono_400Regular,
      'JetBrainsMono-SemiBold': JetBrainsMono_600SemiBold,
      'JetBrainsMono-Bold': JetBrainsMono_700Bold,
    });
    setFontsLoaded(true);
  };

  const loadData = async () => {
    try {
      const accountsData = await AsyncStorage.getItem(STORAGE_KEY_ACCOUNTS);
      const transactionsData = await AsyncStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      const remindersData = await AsyncStorage.getItem(STORAGE_KEY_REMINDERS);
      const hasSeenOnboarding = await AsyncStorage.getItem('@bloom_budget_onboarding_complete');
      
      if (accountsData) setAccounts(JSON.parse(accountsData));
      if (transactionsData) setTransactions(JSON.parse(transactionsData));
      if (remindersData) setReminders(JSON.parse(remindersData));
      
      // Show onboarding if first time
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      const billNotif = await AsyncStorage.getItem('billNotifications');
      const dailyRemind = await AsyncStorage.getItem('dailyReminder');
      const currency = await AsyncStorage.getItem('primaryCurrency');
      
      if (biometric) setBiometricEnabled(biometric === 'true');
      if (billNotif) setBillNotificationsEnabled(billNotif === 'true');
      if (dailyRemind) setDailyReminderEnabled(dailyRemind === 'true');
      if (currency) setPrimaryCurrency(currency as 'PHP' | 'USD' | 'JPY');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveAccounts = async (newAccounts: Account[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(newAccounts));
      setAccounts(newAccounts);
    } catch (error) {
      Alert.alert('Error', 'Failed to save accounts');
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transactions');
    }
  };

  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminders');
    }
  };

  const getCurrencySymbol = (currency?: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'JPY': return '¥';
      case 'PHP':
      default: return '₱';
    }
  };

  const openEditWallet = (account: Account) => {
    setEditingAccount(account);
    setNewWalletName(account.name);
    setNewWalletBalance(account.balance.toString());
    setNewWalletType(account.type);
    setNewWalletInstitution(account.institution || 'BDO');
    setNewWalletColor(account.color);
    setNewWalletGradient(account.gradient || [account.color, account.color]);
    setNewWalletCurrency(account.currency || 'PHP');
    setShowAddWallet(true);
  };

  const addOrUpdateWallet = () => {
    if (!newWalletName.trim()) {
      Alert.alert('Error', 'Please enter wallet name');
      return;
    }

    const balanceNum = parseFloat(removeCommas(newWalletBalance)) || 0;

    if (editingAccount) {
      // Update existing
      const updatedAccounts = accounts.map(acc =>
        acc.id === editingAccount.id
          ? {
              ...acc,
              name: newWalletName.trim(),
              balance: balanceNum,
              type: newWalletType,
              institution: newWalletInstitution,
              color: newWalletColor,
              gradient: newWalletGradient,
              currency: newWalletCurrency,
            }
          : acc
      );
      saveAccounts(updatedAccounts);
      Alert.alert('Success', 'Wallet updated!');
    } else {
      // Add new
      const newAccount: Account = {
        id: Date.now(),
        name: newWalletName.trim(),
        balance: balanceNum,
        type: newWalletType,
        institution: newWalletInstitution,
        color: newWalletColor,
        gradient: newWalletGradient,
        lastFour: Math.floor(1000 + Math.random() * 9000).toString(),
        currency: newWalletCurrency,
      };
      saveAccounts([newAccount, ...accounts]);
      Alert.alert('Success', 'Wallet created!');
    }
    
    closeWalletModal();
  };

  const deleteWallet = (id: number) => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure? All related transactions will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newAccounts = accounts.filter(acc => acc.id !== id);
            saveAccounts(newAccounts);
          },
        },
      ]
    );
  };

  const closeWalletModal = () => {
    setShowAddWallet(false);
    setEditingAccount(null);
    setNewWalletName('');
    setNewWalletBalance('');
    setNewWalletType('bank');
    setNewWalletInstitution('BDO');
    setNewWalletColor('#FF6B9D');
    setNewWalletGradient(['#FF6B9D', '#C44569']);
  };

  const addTransaction = () => {
    if (!newTransactionAmount || !newTransactionAccount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (newTransactionType === 'transfer' && !newTransactionToAccount) {
      Alert.alert('Error', 'Please select destination account for transfer');
      return;
    }

    const amount = parseFloat(removeCommas(newTransactionAmount));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Find the source account
    const sourceAccount = accounts.find(acc => acc.id === newTransactionAccount);
    if (!sourceAccount) {
      Alert.alert('Error', 'Account not found');
      return;
    }

    // Balance validation for expenses and transfers
    if (newTransactionType === 'expense' || newTransactionType === 'transfer') {
      if (amount > sourceAccount.balance) {
        const currencySymbol = getCurrencySymbol(sourceAccount.currency);
        Alert.alert(
          'Insufficient Balance',
          `You only have ${currencySymbol}${formatAmount(sourceAccount.balance)} available in ${sourceAccount.name}.\n\nYou're trying to ${newTransactionType === 'expense' ? 'spend' : 'transfer'} ${currencySymbol}${formatAmount(amount)}.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      amount,
      type: newTransactionType,
      category: newTransactionCategory,
      accountId: newTransactionAccount,
      merchant: newTransactionMerchant.trim() || 'Unknown',
      date: new Date().toISOString(),
    };

    saveTransactions([newTransaction, ...transactions]);
    
    // Update account balances
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === newTransactionAccount) {
        // From account (subtract for expense/transfer, add for income)
        const newBalance = newTransactionType === 'income' 
          ? acc.balance + amount 
          : acc.balance - amount;
        return { ...acc, balance: newBalance };
      }
      if (newTransactionType === 'transfer' && acc.id === newTransactionToAccount) {
        // To account (add)
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });
    saveAccounts(updatedAccounts);

    setNewTransactionAmount('');
    setNewTransactionMerchant('');
    setNewTransactionAccount(null);
    setNewTransactionToAccount(null);
    setShowAddTransaction(false);
    Alert.alert('Success', 'Transaction logged!');
  };

  const deleteTransaction = (id: number) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const transaction = transactions.find(t => t.id === id);
            if (transaction) {
              // Reverse the balance change
              const updatedAccounts = accounts.map(acc => {
                if (acc.id === transaction.accountId) {
                  const newBalance = transaction.type === 'expense' 
                    ? acc.balance + transaction.amount 
                    : acc.balance - transaction.amount;
                  return { ...acc, balance: newBalance };
                }
                return acc;
              });
              saveAccounts(updatedAccounts);
            }
            
            const newTransactions = transactions.filter(t => t.id !== id);
            saveTransactions(newTransactions);
          },
        },
      ]
    );
  };

  const addReminder = () => {
    if (!newReminderName || !newReminderAmount || !newReminderAccount || !newReminderDueDate) {
      Alert.alert('Error', 'Please fill in all required fields including date');
      return;
    }

    // Remove commas before parsing
    const amount = parseFloat(removeCommas(newReminderAmount));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Check if selected date is in the past
    const selectedDate = new Date(newReminderDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert('Error', 'Please select a future date');
      return;
    }

    const newReminder: Reminder = {
      id: Date.now(),
      name: newReminderName.trim(),
      amount,
      dueDate: newReminderDueDate,
      category: newReminderCategory,
      accountId: newReminderAccount,
      autoRenew: newReminderAutoRenew,
      isPaid: false,
      icon: newReminderIcon,
    };

    saveReminders([newReminder, ...reminders]);
    setShowAddReminder(false);
    setNewReminderName('');
    setNewReminderAmount('');
    setNewReminderDueDate('');
    setNewReminderCategory('subscription');
    setNewReminderAccount(null);
    setNewReminderAutoRenew(false);
    setNewReminderIcon('movie');
    Alert.alert('Success', 'Reminder created!');
  };

  const markReminderAsPaid = (id: number) => {
    const updatedReminders = reminders.map(r =>
      r.id === id ? { ...r, isPaid: true, paidDate: new Date().toISOString() } : r
    );
    saveReminders(updatedReminders);
    Alert.alert('Success', 'Marked as paid!');
  };

  const snoozeReminder = (id: number) => {
    Alert.alert('Snoozed', 'Reminder snoozed for 3 days');
  };

  const dismissReminder = (id: number) => {
    Alert.alert(
      'Dismiss Reminder',
      'This will remove the reminder from your list. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: () => {
            const newReminders = reminders.filter(r => r.id !== id);
            saveReminders(newReminders);
            Alert.alert('Dismissed', 'Reminder has been removed');
          },
        },
      ]
    );
  };

  const deleteReminder = (id: number) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this recurring reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newReminders = reminders.filter(r => r.id !== id);
            saveReminders(newReminders);
          },
        },
      ]
    );
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Biometric authentication functions
  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  };

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      // Enabling biometric - require authentication first
      const isSupported = await checkBiometricSupport();
      if (!isSupported) {
        Alert.alert('Not Available', 'Biometric authentication is not available on this device');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric lock',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        setBiometricEnabled(true);
        await AsyncStorage.setItem('biometricEnabled', 'true');
        Alert.alert('Enabled', 'Biometric lock has been enabled');
      }
    } else {
      // Disabling - just toggle off
      setBiometricEnabled(false);
      await AsyncStorage.setItem('biometricEnabled', 'false');
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@bloom_budget_onboarding_complete', 'true');
    setShowOnboarding(false);
    // Start interactive guide after onboarding
    setTimeout(() => setShowGuide(true), 500);
  };

  const onboardingScreens = [
    {
      title: 'Welcome to Bloom Budget',
      description: 'Track your spending, manage multiple wallets, and take control of your finances.',
      icon: '💰',
    },
    {
      title: 'Create Wallets',
      description: 'Add your bank accounts, credit cards, and digital wallets in one place.',
      icon: '💳',
    },
    {
      title: 'Track Transactions',
      description: 'Log expenses, income, and transfers between accounts with ease.',
      icon: '📊',
    },
    {
      title: 'Choose Your Currency',
      description: 'Support for PHP, USD, and JPY. Each wallet can have its own currency.',
      icon: '💱',
    },
  ];

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} hidden={false} />
        
        {/* Skeleton Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <View style={styles.headerLeft}>
            <View style={[styles.skeletonAvatar, isDarkMode && styles.skeletonDark]}>
              <LinearGradient
                colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.skeletonShimmer}
              />
            </View>
            <View>
              <View style={[styles.skeletonText, { width: 80, height: 10 }]}>
                <LinearGradient
                  colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.skeletonShimmer}
                />
              </View>
              <View style={[styles.skeletonText, { width: 100, height: 16, marginTop: 4 }]}>
                <LinearGradient
                  colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.skeletonShimmer}
                />
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.skeletonIconButton, isDarkMode && styles.skeletonDark]}>
              <LinearGradient
                colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.skeletonShimmer}
              />
            </View>
            <View style={[styles.skeletonIconButton, isDarkMode && styles.skeletonDark]}>
              <LinearGradient
                colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.skeletonShimmer}
              />
            </View>
          </View>
        </View>

        {/* Skeleton Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={[styles.skeletonBalanceCard, isDarkMode && styles.skeletonDark]}>
            <LinearGradient
              colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.skeletonShimmer}
            />
          </View>

          {/* Section Title */}
          <View style={[styles.skeletonText, { width: 150, height: 18, marginTop: 24, marginBottom: 16 }]}>
            <LinearGradient
              colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.skeletonShimmer}
            />
          </View>

          {/* Wallet Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2].map((i) => (
              <View key={i} style={[styles.skeletonWalletCard, isDarkMode && styles.skeletonDark]}>
                <LinearGradient
                  colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.skeletonShimmer}
                />
              </View>
            ))}
          </ScrollView>

          {/* Transactions */}
          <View style={[styles.skeletonText, { width: 180, height: 18, marginTop: 24, marginBottom: 16 }]}>
            <LinearGradient
              colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.skeletonShimmer}
            />
          </View>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonTransaction, isDarkMode && styles.skeletonDark]}>
              <LinearGradient
                colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.skeletonShimmer}
              />
            </View>
          ))}
        </ScrollView>

        {/* Skeleton Bottom Nav */}
        <View style={styles.bottomNav}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonNavItem}>
              <View style={[styles.skeletonText, { width: 24, height: 24, borderRadius: 12 }]}>
                <LinearGradient
                  colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.skeletonShimmer}
                />
              </View>
              <View style={[styles.skeletonText, { width: 60, height: 10, marginTop: 4 }]}>
                <LinearGradient
                  colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.skeletonShimmer}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  const renderOnboarding = () => {
    const currentOnboarding = onboardingScreens[onboardingStep];
    const isLastStep = onboardingStep === onboardingScreens.length - 1;

    const handleNext = () => {
      // Reset animations
      onboardingFadeAnim.setValue(0);
      onboardingSlideAnim.setValue(50);
      
      if (isLastStep) {
        completeOnboarding();
      } else {
        setOnboardingStep(onboardingStep + 1);
      }
    };

    const handleBack = () => {
      // Reset animations
      onboardingFadeAnim.setValue(0);
      onboardingSlideAnim.setValue(50);
      setOnboardingStep(onboardingStep - 1);
    };

    return (
      <Modal visible={showOnboarding} animationType="fade" transparent={false}>
        <View style={[styles.onboardingContainer, isDarkMode && styles.containerDark]}>
          <Animated.View 
            style={[
              styles.onboardingContent,
              {
                opacity: onboardingFadeAnim,
                transform: [{ translateY: onboardingSlideAnim }],
              }
            ]}
          >
            <Text style={styles.onboardingIcon}>{currentOnboarding.icon}</Text>
            <Text style={[styles.onboardingTitle, isDarkMode && styles.textDark]}>{currentOnboarding.title}</Text>
            <Text style={[styles.onboardingDescription, isDarkMode && styles.textSecondaryDark]}>
              {currentOnboarding.description}
            </Text>

            {/* Pagination Dots */}
            <View style={styles.onboardingDots}>
              {onboardingScreens.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.onboardingDot,
                    index === onboardingStep && styles.onboardingDotActive,
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          <View style={styles.onboardingButtons}>
            {onboardingStep > 0 && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.onboardingButtonSecondary}
                onPress={handleBack}
              >
                <Text style={styles.onboardingButtonSecondaryText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              activeOpacity={1}
              style={styles.onboardingButtonPrimary}
              onPress={handleNext}
            >
              <Text style={styles.onboardingButtonPrimaryText}>
                {isLastStep ? "Get Started" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>

          {!isLastStep && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.onboardingSkip}
              onPress={completeOnboarding}
            >
              <Text style={styles.onboardingSkipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    );
  };

  const guideSteps = [
    {
      icon: '➕',
      title: 'Add Your First Wallet',
      description: 'Tap the pink + button at the bottom right to create a wallet or log transactions',
    },
    {
      icon: '🌙',
      title: 'Dark Mode',
      description: 'Toggle dark mode using the sun icon at the top right for comfortable viewing',
    },
    {
      icon: '🧭',
      title: 'Navigate',
      description: 'Use the bottom navigation to switch between Dashboard, Wallets, Analytics, and Settings',
    },
  ];

  const renderGuide = () => {
    if (!showGuide || guideStep >= guideSteps.length) return null;
    
    const currentGuide = guideSteps[guideStep];
    
    return (
      <Modal visible={showGuide} animationType="fade" transparent>
        <View style={styles.guideOverlay}>
          {/* Dark overlay */}
          <View style={styles.guideDarkOverlay} />
          
          {/* Guide content card - centered */}
          <View style={styles.guideContentCentered}>
            <Text style={styles.guideIcon}>{currentGuide.icon}</Text>
            <Text style={styles.guideTitle}>{currentGuide.title}</Text>
            <Text style={styles.guideDescription}>{currentGuide.description}</Text>
            
            {/* Progress dots */}
            <View style={styles.guideDots}>
              {guideSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.guideDot,
                    index === guideStep && styles.guideDotActive,
                  ]}
                />
              ))}
            </View>
            
            <View style={styles.guideButtons}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.guideButtonPrimary}
                onPress={() => {
                  if (guideStep < guideSteps.length - 1) {
                    setGuideStep(guideStep + 1);
                  } else {
                    setShowGuide(false);
                    setGuideStep(0);
                  }
                }}
              >
                <Text style={styles.guideButtonPrimaryText}>
                  {guideStep === guideSteps.length - 1 ? 'Got it!' : 'Next'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setShowGuide(false);
                  setGuideStep(0);
                }}
              >
                <Text style={styles.guideSkipText}>Skip Tutorial</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderDashboard = () => (
    <ScrollView style={[styles.content, isDarkMode && styles.contentDark]} showsVerticalScrollIndicator={false}>
      {/* Total Balance Card */}
      <LinearGradient
        colors={isDarkMode ? ['#312f37', '#3d2a3a'] : ['#ffffff', '#ffe8f0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.balanceCard, isDarkMode && styles.balanceCardDark]}
      >
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceLabel, isDarkMode && styles.textDark]}>TOTAL NET WORTH</Text>
          <View style={styles.growthBadge}>
            <TrendingUp size={14} color="#006947" />
            <Text style={styles.growthText}>+8.4% this mo</Text>
          </View>
        </View>
        <View style={styles.balanceAmountRow}>
          <Text style={styles.currencySymbol}>₱</Text>
          <Text style={[styles.balanceAmount, isDarkMode && styles.textDark]}>{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
        
        {/* Income/Expense Pills */}
        <View style={styles.summaryPills}>
          <View style={[styles.summaryPill, isDarkMode && styles.summaryPillDark]}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E8F5F0' }]}>
              <ArrowDown size={18} color="#006947" />
            </View>
            <View>
              <Text style={[styles.summaryLabel, isDarkMode && styles.textDark]}>Income</Text>
              <Text style={styles.summaryAmountPositive}>+₱{formatAmount(totalIncome)}</Text>
            </View>
          </View>
          <View style={[styles.summaryPill, isDarkMode && styles.summaryPillDark]}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FFE5EC' }]}>
              <ArrowUp size={18} color="#b80045" />
            </View>
            <View>
              <Text style={[styles.summaryLabel, isDarkMode && styles.textDark]}>Expenses</Text>
              <Text style={styles.summaryAmountNegative}>-₱{formatAmount(totalExpenses)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* My Wallets Section */}
      <View style={[styles.section, isDarkMode && styles.sectionDark]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>My Wallets & Cards</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{accounts.length} Active</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowAddWallet(true)} style={styles.addButton}>
            <Plus size={14} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Cards Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
          {accounts.map((account) => (
            <TouchableOpacity activeOpacity={1}
              key={account.id}
              style={styles.walletCard}
              onPress={() => openEditWallet(account)}
            >
              <LinearGradient
                colors={(account.gradient || [account.color, account.color]) as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletCardGradient}
              >
                <View style={styles.walletCardHeader}>
                <View style={styles.walletInstitutionRow}>
                  <Building2 size={16} color="#fff" />
                  <Text style={styles.walletInstitution}>{account.institution || account.type.toUpperCase()}</Text>
                </View>
                <View style={styles.walletDebitBadge}>
                  <CreditCard size={12} color="#fff" />
                  <Text style={styles.walletDebitText}>DEBIT</Text>
                </View>
              </View>
              <View style={styles.walletChipContainer}>
                <View style={styles.walletChip}>
                  <Image 
                    source={require('./assets/chip.png')} 
                    style={styles.chipImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={styles.walletCardFooter}>
                <View>
                  <Text style={styles.walletNicknameLabel}>ACCOUNT NICKNAME</Text>
                  <Text style={styles.walletNickname}>{account.name}</Text>
                  <Text style={styles.walletLastFour}>•••• {account.lastFour}</Text>
                </View>
                <View style={styles.walletBalanceContainer}>
                  <Text style={styles.walletBalanceLabel}>AVAILABLE BALANCE</Text>
                  <Text style={styles.walletBalance}>{getCurrencySymbol(account.currency)}{formatAmount(account.balance)}</Text>
                </View>
              </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
          
          {accounts.length === 0 && (
            <TouchableOpacity activeOpacity={1} 
              style={styles.emptyWallets}
              onPress={() => setShowAddWallet(true)}
            >
              <Plus size={32} color="#8f6f73" />
              <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>No wallets yet</Text>
              <Text style={[styles.emptySubtext, isDarkMode && styles.emptySubtextDark]}>Tap to create one</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Recent Transactions</Text>
          <TouchableOpacity activeOpacity={1} onPress={() => setCurrentScreen('transactions')}>
            <Text style={[styles.viewAllText, isDarkMode && styles.viewAllTextDark]}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 && (
          <View style={styles.emptyTransactions}>
            <Receipt size={32} color="#8f6f73" />
            <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>No transactions yet</Text>
            <TouchableOpacity activeOpacity={1} 
              style={styles.emptyButton}
              onPress={() => setShowAddTransaction(true)}
            >
              <Text style={styles.emptyButtonText}>Log your first transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {recentTransactions.map((transaction) => {
          const account = accounts.find(a => a.id === transaction.accountId);
          const CategoryIcon = categoryIcons[transaction.category] || MoreHorizontal;
          const currencySymbol = getCurrencySymbol(account?.currency);
          return (
            <View key={transaction.id} style={[styles.transactionItem, isDarkMode && styles.transactionItemDark]}>
              <View style={styles.transactionContent}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.type === 'income' ? '#E8F5F0' : '#FFE5EC' }
                  ]}>
                    <CategoryIcon size={22} color={transaction.type === 'income' ? '#006947' : '#b80045'} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionMerchant, isDarkMode && styles.textDark]} numberOfLines={1}>{transaction.merchant}</Text>
                    <Text style={[styles.transactionDetails, isDarkMode && styles.textSecondaryDark]} numberOfLines={1}>
                      {transaction.category} • {account?.name || 'Unknown'}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.transactionAmountPositive : styles.transactionAmountNegative
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{formatAmount(transaction.amount)}
                  </Text>
                  <Text style={[styles.transactionTime, isDarkMode && styles.textSecondaryDark]}>
                    {new Date(transaction.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderTransactions = () => {
    // Group by date periods for clearer history
    const sortedTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const groups: { label: string; key: string; items: Transaction[] }[] = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 6); // Last 7 days including today
    
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 13); // 7-13 days ago
    
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    
    sortedTx.forEach((tx) => {
      const d = new Date(tx.date);
      d.setHours(0, 0, 0, 0);
      
      let label;
      let key;
      
      if (d.getTime() === today.getTime()) {
        label = 'Today';
        key = 'today';
      } else if (d.getTime() === yesterday.getTime()) {
        label = 'Yesterday';
        key = 'yesterday';
      } else if (d >= thisWeekStart && d < yesterday) {
        label = 'This Week';
        key = 'this-week';
      } else if (d >= lastWeekStart && d < lastWeekEnd) {
        label = 'Last Week';
        key = 'last-week';
      } else {
        label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        key = `${d.getFullYear()}-${d.getMonth()}`;
      }
      
      const existingGroup = groups.find(g => g.key === key);
      if (existingGroup) {
        existingGroup.items.push(tx);
      } else {
        groups.push({ label, key, items: [tx] });
      }
    });

    return (
      <ScrollView style={[styles.content, isDarkMode && styles.contentDark]} showsVerticalScrollIndicator={false}>
        <View style={[styles.pageHeader, isDarkMode && styles.pageHeaderDark]}>
          <View>
            <Text style={[styles.pageTitle, isDarkMode && styles.textDark]}>Transactions</Text>
            <Text style={[styles.pageSubtitle, isDarkMode && styles.pageSubtitleDark]}>All spending & income</Text>
          </View>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowAddTransaction(true)} style={styles.addButton}>
            <Plus size={14} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 && (
          <View style={[styles.emptyPage, isDarkMode && styles.emptyPageDark]}>
            <Receipt size={64} color="#e3bdc1" />
            <Text style={[styles.emptyPageTitle, isDarkMode && styles.emptyPageTitleDark]}>No transactions yet</Text>
            <Text style={[styles.emptyPageText, isDarkMode && styles.emptyPageTextDark]}>Log your spending and income to see your history here</Text>
            <TouchableOpacity activeOpacity={1} style={styles.emptyPageButton} onPress={() => setShowAddTransaction(true)}>
              <Plus size={20} color="#fff" />
              <Text style={styles.emptyPageButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {groups.map((group) => (
          <View key={group.key} style={styles.txGroup}>
            <Text style={[styles.txGroupLabel, isDarkMode && styles.textSecondaryDark]}>{group.label}</Text>
            {group.items.map((transaction) => {
              const account = accounts.find(a => a.id === transaction.accountId);
              const CategoryIcon = categoryIcons[transaction.category] || MoreHorizontal;
              const currencySymbol = getCurrencySymbol(account?.currency);
              return (
                <View key={transaction.id} style={[styles.transactionItem, isDarkMode && styles.transactionItemDark]}>
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionLeft}>
                      <View style={[
                        styles.transactionIcon,
                        { backgroundColor: transaction.type === 'income' ? '#E8F5F0' : '#FFE5EC' }
                      ]}>
                        <CategoryIcon size={22} color={transaction.type === 'income' ? '#006947' : '#b80045'} />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={[styles.transactionMerchant, isDarkMode && styles.textDark]}>{transaction.merchant}</Text>
                        <Text style={[styles.transactionDetails, isDarkMode && styles.textSecondaryDark]}>
                          {transaction.category} • {account?.name || 'Unknown'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text style={[
                        styles.transactionAmount,
                        transaction.type === 'income' ? styles.transactionAmountPositive : styles.transactionAmountNegative
                      ]}>
                        {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{formatAmount(transaction.amount)}
                      </Text>
                      <Text style={[styles.transactionTime, isDarkMode && styles.textSecondaryDark]}>
                        {new Date(transaction.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.transactionDeleteButton}
                    onPress={() => confirmDeleteTransaction(transaction)}
                  >
                    <Trash2 size={18} color="#ba1a1a" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  const confirmDeleteTransaction = (tx: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Remove "${tx.merchant}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(tx.id) },
      ]
    );
  };

  const renderReminders = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Filter reminders based on current filter
    let filteredReminders = reminders;
    if (reminderFilter === 'upcoming') {
      filteredReminders = reminders.filter(r => !r.isPaid);
    } else if (reminderFilter === 'subscription') {
      filteredReminders = reminders.filter(r => r.category === 'subscription');
    } else if (reminderFilter === 'utility') {
      filteredReminders = reminders.filter(r => r.category === 'utility' || r.category === 'rent');
    }

    // Separate paid and unpaid, sort by date
    const unpaidReminders = filteredReminders.filter(r => !r.isPaid).sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });
    const paidReminders = filteredReminders.filter(r => r.isPaid);

    // Calculate totals
    const totalCommitments = reminders.reduce((sum, r) => sum + r.amount, 0);
    const paidAmount = paidReminders.reduce((sum, r) => sum + r.amount, 0);
    const upcomingAmount = unpaidReminders.reduce((sum, r) => sum + r.amount, 0);

    // Due this week (next 7 days)
    const dueThisWeek = unpaidReminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    return (
      <ScrollView 
        style={[styles.content, isDarkMode && styles.contentDark]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={[styles.pageHeader, isDarkMode && styles.pageHeaderDark]}>
          <View>
            <Text style={[styles.pageTitle, isDarkMode && styles.textDark]}>Monthly Reminders</Text>
            <Text style={[styles.pageSubtitle, isDarkMode && styles.pageSubtitleDark]}>{monthName}</Text>
          </View>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowAddReminder(true)} style={styles.addButton}>
            <Plus size={14} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Total Commitments Overview Card */}
        <LinearGradient
          colors={['#fd6989', '#de245b', '#b80045']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.commitmentCard}
        >
          <View style={styles.commitmentHeader}>
            <Text style={styles.commitmentLabel}>TOTAL COMMITMENTS</Text>
            <Text style={styles.commitmentCycle}>MONTHLY</Text>
          </View>
          <Text style={styles.commitmentAmount}>₱{formatAmount(totalCommitments)}</Text>
          <Text style={styles.commitmentSubtext}>{reminders.length} recurring payments</Text>

          {/* Progress Bar */}
          <View style={styles.commitmentProgress}>
            <View style={[styles.commitmentProgressFill, { width: `${totalCommitments > 0 ? (paidAmount / totalCommitments) * 100 : 0}%` }]} />
          </View>

          {/* Paid vs Upcoming */}
          <View style={styles.commitmentStats}>
            <View style={styles.commitmentStat}>
              <Text style={styles.commitmentStatLabel}>PAID</Text>
              <Text style={styles.commitmentStatValue}>₱{formatAmount(paidAmount)}</Text>
            </View>
            <View style={styles.commitmentStat}>
              <Text style={styles.commitmentStatLabel}>UPCOMING</Text>
              <Text style={styles.commitmentStatValue}>₱{formatAmount(upcomingAmount)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterChips}
          contentContainerStyle={{ paddingRight: 60 }}
        >
          <TouchableOpacity activeOpacity={1}
            style={[
              styles.filterChip, 
              reminderFilter === 'all' && styles.filterChipActive,
              isDarkMode && reminderFilter !== 'all' && styles.filterChipDark
            ]}
            onPress={() => setReminderFilter('all')}
          >
            <Text style={[
              styles.filterChipText, 
              reminderFilter === 'all' && styles.filterChipTextActive,
              isDarkMode && reminderFilter !== 'all' && styles.filterChipTextDark
            ]}>
              All ({reminders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1}
            style={[
              styles.filterChip, 
              reminderFilter === 'upcoming' && styles.filterChipActive,
              isDarkMode && reminderFilter !== 'upcoming' && styles.filterChipDark
            ]}
            onPress={() => setReminderFilter('upcoming')}
          >
            <Text style={[
              styles.filterChipText, 
              reminderFilter === 'upcoming' && styles.filterChipTextActive,
              isDarkMode && reminderFilter !== 'upcoming' && styles.filterChipTextDark
            ]}>
              Upcoming ({unpaidReminders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1}
            style={[
              styles.filterChip, 
              reminderFilter === 'subscription' && styles.filterChipActive,
              isDarkMode && reminderFilter !== 'subscription' && styles.filterChipDark
            ]}
            onPress={() => setReminderFilter('subscription')}
          >
            <Text style={[
              styles.filterChipText, 
              reminderFilter === 'subscription' && styles.filterChipTextActive,
              isDarkMode && reminderFilter !== 'subscription' && styles.filterChipTextDark
            ]}>
              Subscriptions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1}
            style={[
              styles.filterChip, 
              reminderFilter === 'utility' && styles.filterChipActive,
              isDarkMode && reminderFilter !== 'utility' && styles.filterChipDark
            ]}
            onPress={() => setReminderFilter('utility')}
          >
            <Text style={[
              styles.filterChipText, 
              reminderFilter === 'utility' && styles.filterChipTextActive,
              isDarkMode && reminderFilter !== 'utility' && styles.filterChipTextDark
            ]}>
              Utilities & Rent
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Due This Week Section */}
        {dueThisWeek.length > 0 && (
          <View style={styles.reminderSection}>
            <View style={styles.reminderSectionHeader}>
              <Text style={[styles.reminderSectionTitle, isDarkMode && styles.textDark]}>Due This Week</Text>
              <View style={styles.reminderBadge}>
                <Text style={styles.reminderBadgeText}>{dueThisWeek.length}</Text>
              </View>
            </View>

            {dueThisWeek.map(reminder => {
              const account = accounts.find(a => a.id === reminder.accountId);
              const dueDate = new Date(reminder.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              const diffTime = dueDate.getTime() - currentDate.getTime();
              const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const dueDateFormatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              return (
                <View key={reminder.id} style={[styles.reminderCard, isDarkMode && styles.reminderCardDark]}>
                  <View style={styles.reminderCardHeader}>
                    <View style={styles.reminderCardLeft}>
                      <View style={[styles.reminderIcon, { backgroundColor: '#ffd9dd' }]}>
                        <Bell size={24} color="#b80045" />
                      </View>
                      <View>
                        <Text style={[styles.reminderName, isDarkMode && styles.textDark]}>{reminder.name}</Text>
                        <Text style={[styles.reminderDueDate, isDarkMode && styles.textMutedDark]}>
                          Due {dueDateFormatted} • in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.reminderCardRight}>
                      <Text style={[styles.reminderAmount, isDarkMode && styles.textDark]}>
                        ₱{formatAmount(reminder.amount)}
                      </Text>
                      <Text style={[styles.reminderFrequency, isDarkMode && styles.textMutedDark]}>per month</Text>
                    </View>
                  </View>

                  {/* Metadata */}
                  <View style={styles.reminderMeta}>
                    <View style={styles.reminderMetaLeft}>
                      <View style={styles.reminderMetaChip}>
                        <CreditCard size={13} color="#5b4043" />
                        <Text style={styles.reminderMetaText}>{account?.name || 'Unknown'}</Text>
                      </View>
                      {reminder.autoRenew && (
                        <View style={[styles.reminderMetaChip, styles.reminderAutoRenew]}>
                          <Zap size={12} color="#006947" />
                          <Text style={styles.reminderAutoRenewText}>Auto-renew</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.reminderActions}>
                    <TouchableOpacity activeOpacity={1}
                      style={styles.reminderActionSecondary}
                      onPress={() => snoozeReminder(reminder.id)}
                    >
                      <Bell size={15} color="#5b4043" />
                      <Text style={styles.reminderActionSecondaryText}>Snooze</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1}
                      style={styles.reminderActionPrimary}
                      onPress={() => markReminderAsPaid(reminder.id)}
                    >
                      <Text style={styles.reminderActionPrimaryText}>Mark as Paid</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* All Upcoming Reminders */}
        {unpaidReminders.length > 0 && (
          <View style={styles.reminderSection}>
            <Text style={[styles.reminderSectionTitle, isDarkMode && styles.textDark, { marginBottom: 16, marginTop: 8 }]}>
              All Upcoming ({unpaidReminders.length})
            </Text>
            {unpaidReminders.map(reminder => {
              const account = accounts.find(a => a.id === reminder.accountId);
              const dueDate = new Date(reminder.dueDate);
              const dueDateFormatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              return (
                <TouchableOpacity activeOpacity={1} key={reminder.id} style={[styles.reminderListItem, isDarkMode && styles.reminderListItemDark]}
                  onPress={() => {
                    Alert.alert(
                      reminder.name,
                      `Due: ${dueDateFormatted}\nAmount: ₱${formatAmount(reminder.amount)}\nAccount: ${account?.name || 'Unknown'}`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Mark as Paid',
                          onPress: () => markReminderAsPaid(reminder.id),
                        },
                        {
                          text: 'Dismiss',
                          style: 'destructive',
                          onPress: () => dismissReminder(reminder.id),
                        },
                      ]
                    );
                  }}
                  onLongPress={() => deleteReminder(reminder.id)}
                >
                  <View style={styles.reminderListLeft}>
                    <View style={[styles.reminderListIcon, { backgroundColor: '#ffd9dd' }]}>
                      <Bell size={20} color="#b80045" />
                    </View>
                    <View>
                      <Text style={[styles.reminderListName, isDarkMode && styles.textDark]}>{reminder.name}</Text>
                      <Text style={[styles.reminderListDate, isDarkMode && styles.textMutedDark]}>
                        Due {dueDateFormatted} • {account?.name}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.reminderListAmount, isDarkMode && styles.textDark]}>₱{formatAmount(reminder.amount)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Completed This Month */}
        {paidReminders.length > 0 && (
          <View style={styles.reminderSection}>
            <View style={styles.reminderSectionHeader}>
              <View style={styles.completedHeader}>
                <View style={styles.completedIcon}>
                  <Text style={styles.completedIconText}>✓</Text>
                </View>
                <Text style={[styles.reminderSectionTitle, isDarkMode && styles.textDark]}>
                  Completed & Paid This Month ({paidReminders.length})
                </Text>
              </View>
            </View>
            {paidReminders.map(reminder => {
              const account = accounts.find(a => a.id === reminder.accountId);
              return (
                <View key={reminder.id} style={[styles.completedItem, isDarkMode && styles.completedItemDark]}>
                  <View style={styles.completedItemLeft}>
                    <View style={styles.completedItemIcon}>
                      <Bell size={20} color="#006947" />
                    </View>
                    <View>
                      <Text style={[styles.completedItemName, isDarkMode && styles.textDark]}>{reminder.name}</Text>
                      <Text style={styles.completedItemDate}>
                        Paid {reminder.paidDate ? new Date(reminder.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.completedItemAmount, isDarkMode && styles.textDark]}>₱{formatAmount(reminder.amount)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {reminders.length === 0 && (
          <View style={[styles.emptyPage, isDarkMode && styles.emptyPageDark]}>
            <Bell size={64} color="#e3bdc1" />
            <Text style={[styles.emptyPageTitle, isDarkMode && styles.emptyPageTitleDark]}>No Reminders Yet</Text>
            <Text style={[styles.emptyPageText, isDarkMode && styles.emptyPageTextDark]}>
              Add recurring payments like subscriptions, rent, and utilities to track monthly commitments
            </Text>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>
    );
  };

  const renderSettings = () => (
    <ScrollView style={[styles.content, isDarkMode && styles.contentDark]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={[styles.pageHeader, isDarkMode && styles.pageHeaderDark]}>
        <View>
          <Text style={[styles.pageTitle, isDarkMode && styles.textDark]}>Settings</Text>
          <Text style={[styles.pageSubtitle, isDarkMode && styles.pageSubtitleDark]}>Account & Preferences</Text>
        </View>
      </View>

      {/* Profile Summary Card */}
      <View style={[styles.profileCard, isDarkMode && styles.profileCardDark]}>
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <View style={[styles.profileAvatar, isDarkMode && styles.profileAvatarDark]}>
              <User size={24} color={isDarkMode ? "#e8d0d3" : "#5b4043"} />
              <View style={styles.profileStatusDot} />
            </View>
            <View>
              <Text style={[styles.profileName, isDarkMode && styles.textDark]}>Hey, You ✨</Text>
              <Text style={[styles.profileEmail, isDarkMode && styles.textMutedDark]}>bloom.user@app.com</Text>
            </View>
          </View>
        </View>
        
        {/* Stats Pills */}
        <View style={styles.profileStats}>
          <View style={[styles.profileStatPill, isDarkMode && styles.profileStatPillDark]}>
            <View style={[styles.profileStatIcon, { backgroundColor: isDarkMode ? '#2a2831' : '#ffd9dd' }]}>
              <Wallet size={16} color="#b80045" />
            </View>
            <View>
              <Text style={[styles.profileStatLabel, isDarkMode && styles.textMutedDark]}>WALLETS</Text>
              <Text style={[styles.profileStatValue, isDarkMode && styles.textDark]}>{accounts.length} Linked</Text>
            </View>
          </View>
          <View style={[styles.profileStatPill, isDarkMode && styles.profileStatPillDark]}>
            <View style={[styles.profileStatIcon, { backgroundColor: isDarkMode ? '#2a2831' : '#ffd9dd' }]}>
              <Bell size={16} color="#b80045" />
            </View>
            <View>
              <Text style={[styles.profileStatLabel, isDarkMode && styles.textMutedDark]}>REMINDERS</Text>
              <Text style={[styles.profileStatValue, isDarkMode && styles.textDark]}>{reminders.length} Active</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Appearance & Display */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <Sun size={16} color="#b80045" />
          <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>APPEARANCE & DISPLAY</Text>
        </View>
        
        <View style={[styles.settingsCard, isDarkMode && styles.settingsCardDark]}>
          {/* Theme Selector */}
          <View style={styles.settingsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Interface Theme</Text>
              <View style={styles.themeSelector}>
                <TouchableOpacity activeOpacity={0.7}
                  style={[styles.themeOption, !isDarkMode && styles.themeOptionActive]}
                  onPress={() => setIsDarkMode(false)}
                >
                  <Text style={[styles.themeOptionText, !isDarkMode && styles.themeOptionTextActive]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}
                  style={[styles.themeOption, isDarkMode && styles.themeOptionActive]}
                  onPress={() => setIsDarkMode(true)}
                >
                  <Text style={[styles.themeOptionText, isDarkMode && styles.themeOptionTextActive]}>Dark</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Currency Selector */}
          <TouchableOpacity activeOpacity={0.7}
            style={[styles.settingsRow, styles.settingsRowBorder, isDarkMode && styles.settingsRowBorderDark]}
            onPress={() => setShowCurrencyPicker(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Primary Currency</Text>
              <Text style={[styles.settingsRowSubtitle, isDarkMode && styles.textMutedDark]}>Reporting & display</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={[styles.currencyBadge, isDarkMode && styles.currencyBadgeDark]}>
                {primaryCurrency === 'PHP' ? 'PHP (₱)' : primaryCurrency === 'USD' ? 'USD ($)' : 'JPY (¥)'}
              </Text>
              <ChevronRight size={20} color={isDarkMode ? "#7a6f73" : "#8f6f73"} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallets & Budget */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <CreditCard size={16} color="#b80045" />
          <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>WALLETS & BUDGETING</Text>
        </View>
        
        <View style={[styles.settingsCard, isDarkMode && styles.settingsCardDark]}>
          <TouchableOpacity activeOpacity={0.7} 
            style={styles.settingsRow}
            onPress={() => setShowAddWallet(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Manage Linked Wallets ({accounts.length})</Text>
              <View style={styles.walletIconsRow}>
                {accounts.slice(0, 3).map((acc, idx) => (
                  <View key={idx} style={[styles.walletIconMini, isDarkMode && styles.walletIconMiniDark]}>
                    <Text style={[styles.walletIconMiniText, isDarkMode && styles.textDark]}>
                      {acc.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                ))}
                {accounts.length > 3 && (
                  <Text style={[styles.settingsRowSubtitle, isDarkMode && styles.textMutedDark]}>+{accounts.length - 3}</Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color={isDarkMode ? "#7a6f73" : "#8f6f73"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reminders & Alerts */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <Bell size={16} color="#b80045" />
          <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>REMINDERS & ALERTS</Text>
        </View>
        
        <View style={[styles.settingsCard, isDarkMode && styles.settingsCardDark]}>
          <TouchableOpacity activeOpacity={0.7}
            style={styles.settingsRow}
            onPress={() => {
              setBillNotificationsEnabled(!billNotificationsEnabled);
              AsyncStorage.setItem('billNotifications', (!billNotificationsEnabled).toString());
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Bill Due Notifications</Text>
              <Text style={[styles.settingsRowSubtitle, isDarkMode && styles.textMutedDark]}>2 days prior at 9:00 AM</Text>
            </View>
            <View style={[styles.toggle, !billNotificationsEnabled && { backgroundColor: '#e3bdc1' }]}>
              <View style={[styles.toggleActive]} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.7}
            style={[styles.settingsRow, styles.settingsRowBorder, isDarkMode && styles.settingsRowBorderDark]}
            onPress={() => {
              setDailyReminderEnabled(!dailyReminderEnabled);
              AsyncStorage.setItem('dailyReminder', (!dailyReminderEnabled).toString());
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Daily Log Reminder</Text>
              <Text style={[styles.settingsRowSubtitle, isDarkMode && styles.textMutedDark]}>Every evening at 8:30 PM</Text>
            </View>
            <View style={[styles.toggle, !dailyReminderEnabled && { backgroundColor: '#e3bdc1' }]}>
              <View style={[styles.toggleActive]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security & Data */}
      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <Lock size={16} color="#b80045" />
          <Text style={[styles.settingsSectionTitle, isDarkMode && styles.settingsSectionTitleDark]}>SECURITY & DATA</Text>
        </View>
        
        <View style={[styles.settingsCard, isDarkMode && styles.settingsCardDark]}>
          <TouchableOpacity activeOpacity={0.7} 
            style={styles.settingsRow}
            onPress={toggleBiometric}
          >
            <View style={[styles.settingsIconCircle, isDarkMode && styles.settingsIconCircleDark]}>
              <Fingerprint size={18} color="#b80045" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Biometric Lock</Text>
              <Text style={[styles.settingsRowSubtitle, isDarkMode && styles.textMutedDark]}>Face ID / Fingerprint</Text>
            </View>
            <View style={[styles.toggle, !biometricEnabled && { backgroundColor: '#e3bdc1' }]}>
              <View style={[styles.toggleActive]} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.7} 
            style={[styles.settingsRow, styles.settingsRowBorder, isDarkMode && styles.settingsRowBorderDark]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Export Transactions</Text>
              <Text style={[styles.settingsRowSubtitle, isDarkMode && styles.textMutedDark]}>Financial audit files</Text>
            </View>
            <View style={styles.settingsRowRight}>
              <View style={[styles.exportBadge, isDarkMode && styles.exportBadgeDark]}>
                <Text style={[styles.exportBadgeText, isDarkMode && styles.textDark]}>CSV, PDF</Text>
              </View>
              <Download size={20} color={isDarkMode ? "#7a6f73" : "#8f6f73"} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.7}
            style={[styles.settingsRow, styles.settingsRowBorder, isDarkMode && styles.settingsRowBorderDark]}
            onPress={async () => {
              Alert.alert(
                'Clear All Data',
                'This will delete all wallets, transactions, and reminders. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      await AsyncStorage.clear();
                      setAccounts([]);
                      setTransactions([]);
                      setReminders([]);
                      Alert.alert('Success', 'All data cleared');
                    },
                  },
                ]
              );
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsRowTitle, isDarkMode && styles.textDark]}>Clear Cache & Local Data</Text>
              <Text style={[styles.settingsRowSubtitle, isDarkMode && styles.textMutedDark]}>Frees up storage</Text>
            </View>
            <RotateCcw size={20} color={isDarkMode ? "#7a6f73" : "#8f6f73"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfoFooter}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={[styles.appInfoText, isDarkMode && styles.textMutedDark]}>
          Bloom Budget v1.0.0 (Build 1)
        </Text>
      </View>

      {/* Currency Picker Modal */}
      <Modal visible={showCurrencyPicker} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>Select Currency</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowCurrencyPicker(false)}>
                <X size={24} color={isDarkMode ? "#e8d0d3" : "#1c1b22"} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {(['PHP', 'USD', 'JPY'] as const).map((curr) => (
                <TouchableOpacity activeOpacity={0.7}
                  key={curr}
                  style={[
                    styles.currencyOption,
                    primaryCurrency === curr && styles.currencyOptionActive,
                    isDarkMode && styles.currencyOptionDark
                  ]}
                  onPress={() => {
                    setPrimaryCurrency(curr);
                    AsyncStorage.setItem('primaryCurrency', curr);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <View>
                    <Text style={[styles.currencyOptionName, isDarkMode && styles.textDark]}>
                      {curr === 'PHP' ? 'Philippine Peso' : curr === 'USD' ? 'US Dollar' : 'Japanese Yen'}
                    </Text>
                    <Text style={[styles.currencyOptionSymbol, isDarkMode && styles.textMutedDark]}>
                      {curr === 'PHP' ? '₱' : curr === 'USD' ? '$' : '¥'} {curr}
                    </Text>
                  </View>
                  {primaryCurrency === curr && (
                    <View style={styles.currencyCheck}>
                      <Text style={styles.currencyCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  const renderLogin = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, isDarkMode && styles.containerDark]}
    >
      <ScrollView style={[styles.content, isDarkMode && styles.contentDark]} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Ambient glow effects */}
        <View style={styles.ambientGlow1} />
        <View style={styles.ambientGlow2} />
        
        {/* Header */}
        <View style={styles.loginHeader}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert('Help', 'Contact support@bloombudget.app')}>
            <Text style={[styles.loginHeaderButton, isDarkMode && styles.textDark]}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Brand section */}
        <View style={styles.loginBrandSection}>
          <View style={styles.loginLogoContainer}>
            <Image 
              source={require('./assets/splash.png')} 
              style={styles.loginLogo}
              resizeMode="contain"
            />
            <View style={styles.loginSecureBadge}>
              <Text style={styles.loginSecureText}>SECURE</Text>
            </View>
          </View>
          
          <Text style={[styles.loginTitle, isDarkMode && styles.textDark]}>Bloom Budget</Text>
          <Text style={[styles.loginSubtitle, isDarkMode && styles.textMutedDark]}>
            Your mindful wealth companion
          </Text>
          
          <View style={[styles.loginWelcomeBanner, isDarkMode && styles.loginWelcomeBannerDark]}>
            <Text style={styles.loginWelcomeText}>
              {isRegistering ? 'Create your account' : 'Sign in to access your linked cards & budgets'}
            </Text>
          </View>
        </View>

        {/* Login form */}
        <View style={[styles.loginFormCard, isDarkMode && styles.loginFormCardDark]}>
          <Text style={[styles.loginFormTitle, isDarkMode && styles.textDark]}>
            {isRegistering ? 'Register' : 'Welcome Back'}
          </Text>
          
          <View style={styles.loginInputContainer}>
            <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>EMAIL</Text>
            <TextInput
              style={[styles.loginInput, isDarkMode && styles.loginInputDark]}
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="you@example.com"
              placeholderTextColor={isDarkMode ? "#7a6f73" : "#8f6f73"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.loginInputContainer}>
            <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>PASSWORD</Text>
            <TextInput
              style={[styles.loginInput, isDarkMode && styles.loginInputDark]}
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="••••••••"
              placeholderTextColor={isDarkMode ? "#7a6f73" : "#8f6f73"}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={handleLogin}>
            <LinearGradient
              colors={['#FF6B8B', '#FF4071']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>
                {isRegistering ? 'Create Account' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.loginDivider}>
            <View style={[styles.loginDividerLine, isDarkMode && styles.loginDividerLineDark]} />
            <Text style={[styles.loginDividerText, isDarkMode && styles.textMutedDark]}>OR</Text>
            <View style={[styles.loginDividerLine, isDarkMode && styles.loginDividerLineDark]} />
          </View>

          {/* Social Login Buttons */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleGoogleSignIn}
            style={[styles.socialButton, isDarkMode && styles.socialButtonDark]}
          >
            <Text style={styles.socialButtonIcon}>G</Text>
            <Text style={[styles.socialButtonText, isDarkMode && styles.textDark]}>Sign in with Google</Text>
          </TouchableOpacity>

          {/* Face ID / Fingerprint Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={async () => {
              const isSupported = await checkBiometricSupport();
              if (isSupported) {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: 'Sign in with biometric',
                  fallbackLabel: 'Use passcode',
                });
                if (result.success) {
                  // Check if user has saved auth
                  const authToken = await AsyncStorage.getItem('@bloom_auth_token');
                  if (authToken) {
                    setIsAuthenticated(true);
                    setShowLogin(false);
                  } else {
                    Alert.alert('No Account', 'Please sign in with email first');
                  }
                }
              } else {
                Alert.alert('Not Available', 'Biometric authentication is not available on this device');
              }
            }}
            style={[styles.socialButton, isDarkMode && styles.socialButtonDark]}
          >
            <Fingerprint size={20} color={isDarkMode ? "#e8d0d3" : "#5b4043"} />
            <Text style={[styles.socialButtonText, isDarkMode && styles.textDark]}>Sign in with Face ID / Fingerprint</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => setIsRegistering(!isRegistering)}
            style={styles.loginToggleButton}
          >
            <Text style={[styles.loginToggleText, isDarkMode && styles.textMutedDark]}>
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.loginToggleTextBold}>
                {isRegistering ? 'Sign In' : 'Register'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderProfile = () => (
    <ScrollView style={[styles.content, isDarkMode && styles.contentDark]} showsVerticalScrollIndicator={false}>
      <View style={[styles.pageHeader, isDarkMode && styles.pageHeaderDark]}>
        <TouchableOpacity activeOpacity={1} onPress={() => setCurrentScreen('settings')}>
          <Text style={[styles.viewAllText, isDarkMode && styles.viewAllTextDark]}>‹ Back</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.emptyPage, isDarkMode && styles.emptyPageDark]}>
        <User size={64} color="#e3bdc1" />
        <Text style={[styles.emptyPageTitle, isDarkMode && styles.emptyPageTitleDark]}>Profile</Text>
        <Text style={[styles.emptyPageText, isDarkMode && styles.emptyPageTextDark]}>Profile details coming soon</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} hidden={false} />
      
      {/* Show login screen if not authenticated */}
      {showLogin && !isAuthenticated ? (
        renderLogin()
      ) : (
        <>
      {/* Onboarding */}
      {showOnboarding && renderOnboarding()}
      
      {/* Interactive Guide */}
      {showGuide && renderGuide()}
      
      {/* Biometric Setup Modal */}
      {showBiometricSetup && (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
              <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
                <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>Enable Biometric Lock?</Text>
              </View>
              <View style={styles.modalBody}>
                <View style={styles.biometricSetupIcon}>
                  <Fingerprint size={64} color="#b80045" />
                </View>
                <Text style={[styles.biometricSetupTitle, isDarkMode && styles.textDark]}>
                  Secure Your Account
                </Text>
                <Text style={[styles.biometricSetupText, isDarkMode && styles.textMutedDark]}>
                  Use Face ID or Fingerprint to quickly and securely access your budget
                </Text>
                <TouchableOpacity activeOpacity={0.8} onPress={async () => {
                  await toggleBiometric();
                  setShowBiometricSetup(false);
                  setShowOnboarding(true);
                }}>
                  <LinearGradient
                    colors={['#FF6B8B', '#FF4071']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.biometricSetupButton}
                  >
                    <Text style={styles.biometricSetupButtonText}>Enable Biometric Lock</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowBiometricSetup(false);
                    setShowOnboarding(true);
                  }}
                  style={styles.biometricSetupSkip}
                >
                  <Text style={[styles.biometricSetupSkipText, isDarkMode && styles.textMutedDark]}>
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, isDarkMode && styles.avatarDark]}>
            <User size={20} color={isDarkMode ? "#e3bdc1" : "#5b4043"} />
          </View>
          <View>
            <Text style={[styles.welcomeText, isDarkMode && styles.textDark]}>Welcome back</Text>
            <Text style={[styles.nameText, isDarkMode && styles.textDark]}>{userName} ✨</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity activeOpacity={1} style={[styles.iconButton, isDarkMode && styles.iconButtonDark]} onPress={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={18} color="#e3bdc1" /> : <Sun size={18} color="#5b4043" />}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} style={[styles.iconButton, isDarkMode && styles.iconButtonDark]}>
            <Bell size={18} color="#b80045" />
            <View style={[styles.notificationDot, isDarkMode && styles.notificationDotDark]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Screen */}
      {currentScreen === 'dashboard' && renderDashboard()}
      {currentScreen === 'transactions' && renderTransactions()}
      {currentScreen === 'reminders' && renderReminders()}
      {currentScreen === 'settings' && renderSettings()}
      {currentScreen === 'profile' && renderProfile()}
        </>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity activeOpacity={1}
        style={styles.fab}
        onPress={() => setShowActionMenu(true)}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      {isAuthenticated && !showLogin && (
      <View style={[styles.bottomNav, isDarkMode && styles.bottomNavDark]}>
        <TouchableOpacity activeOpacity={1}
          style={[styles.navItem, currentScreen === 'dashboard' && styles.navItemActive, isDarkMode && currentScreen === 'dashboard' && styles.navItemActiveDark]}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <LayoutDashboard size={22} color={currentScreen === 'dashboard' ? '#b80045' : (isDarkMode ? '#9a8a8d' : '#5b4043')} />
          <Text style={[styles.navLabel, currentScreen === 'dashboard' && styles.navLabelActive, isDarkMode && { color: '#e8d0d3' }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1}
          style={[styles.navItem, currentScreen === 'transactions' && styles.navItemActive, isDarkMode && currentScreen === 'transactions' && styles.navItemActiveDark]}
          onPress={() => setCurrentScreen('transactions')}
        >
          <Wallet size={22} color={currentScreen === 'transactions' ? '#b80045' : (isDarkMode ? '#9a8a8d' : '#5b4043')} />
          <Text style={[styles.navLabel, currentScreen === 'transactions' && styles.navLabelActive, isDarkMode && { color: '#e8d0d3' }]}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1}
          style={[styles.navItem, currentScreen === 'reminders' && styles.navItemActive, isDarkMode && currentScreen === 'reminders' && styles.navItemActiveDark]}
          onPress={() => setCurrentScreen('reminders')}
        >
          <Bell size={22} color={currentScreen === 'reminders' ? '#b80045' : (isDarkMode ? '#9a8a8d' : '#5b4043')} />
          <Text style={[styles.navLabel, currentScreen === 'reminders' && styles.navLabelActive, isDarkMode && { color: '#e8d0d3' }]}>Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1}
          style={[styles.navItem, currentScreen === 'settings' && styles.navItemActive, isDarkMode && currentScreen === 'settings' && styles.navItemActiveDark]}
          onPress={() => setCurrentScreen('settings')}
        >
          <Settings size={22} color={currentScreen === 'settings' ? '#b80045' : (isDarkMode ? '#9a8a8d' : '#5b4043')} />
          <Text style={[styles.navLabel, currentScreen === 'settings' && styles.navLabelActive, isDarkMode && { color: '#e8d0d3' }]}>Settings</Text>
        </TouchableOpacity>
      </View>
      )}

      {/* Add/Edit Wallet Modal */}
      <Modal visible={showAddWallet} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
              <TouchableOpacity activeOpacity={1} onPress={closeWalletModal}>
                <X size={24} color={isDarkMode ? '#e8d0d3' : '#1c1b22'} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>{editingAccount ? 'Edit Wallet' : 'Add New Wallet'}</Text>
              <TouchableOpacity activeOpacity={1} onPress={addOrUpdateWallet}>
                <Text style={[styles.modalSave, isDarkMode && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Card Preview */}
              <View style={styles.cardPreviewSection}>
                <Text style={styles.cardPreviewLabel}>CARD PREVIEW</Text>
                <View style={styles.cardPreviewContainer}>
                  <LinearGradient
                    colors={newWalletGradient as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardPreview}
                  >
                    <View style={styles.cardPreviewHeader}>
                      <View style={styles.cardPreviewInstitution}>
                        <Building2 size={14} color="#fff" />
                        <Text style={styles.cardPreviewInstitutionText}>{newWalletInstitution}</Text>
                      </View>
                      <View style={styles.cardPreviewDebit}>
                        <CreditCard size={10} color="#fff" />
                        <Text style={styles.cardPreviewDebitText}>DEBIT</Text>
                      </View>
                    </View>
                    <View style={styles.cardPreviewChipContainer}>
                      <View style={styles.cardPreviewChip}>
                        <Image 
                          source={require('./assets/chip.png')} 
                          style={styles.chipImagePreview}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                    <View style={styles.cardPreviewFooter}>
                      <View>
                        <Text style={styles.cardPreviewNicknameLabel}>ACCOUNT NICKNAME</Text>
                        <Text style={styles.cardPreviewNickname}>{newWalletName || 'Wallet Name'}</Text>
                      </View>
                      <View>
                        <Text style={styles.cardPreviewBalanceLabel}>AVAILABLE BALANCE</Text>
                        <Text style={styles.cardPreviewBalance}>{getCurrencySymbol(newWalletCurrency)}{newWalletBalance || '0.00'}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              <Text style={[styles.stepTitle, isDarkMode && styles.stepTitleDark]}>Step 1: Select Institution / Type</Text>
              <View style={styles.institutionButtons}>
                {['BDO', 'BPI', 'Metrobank', 'UnionBank', 'GCash', 'PayMaya', 'Other'].map((inst) => (
                  <TouchableOpacity activeOpacity={1}
                    key={inst}
                    style={[styles.institutionButton, newWalletInstitution === inst && styles.institutionButtonActive, isDarkMode && newWalletInstitution !== inst && styles.institutionButtonDark]}
                    onPress={() => setNewWalletInstitution(inst)}
                  >
                    <Building2 size={18} color={newWalletInstitution === inst ? '#fff' : (isDarkMode ? '#e8d0d3' : '#1c1b22')} />
                    <Text style={[styles.institutionButtonText, newWalletInstitution === inst && { color: '#fff' }, isDarkMode && newWalletInstitution !== inst && styles.institutionButtonTextDark]}>
                      {inst}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.stepTitle, isDarkMode && styles.stepTitleDark]}>Step 2: Account Details & Classification</Text>

              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>Wallet Nickname</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                value={newWalletName}
                onChangeText={setNewWalletName}
                placeholder="e.g., Everyday Spending"
                placeholderTextColor={isDarkMode ? '#7a6f73' : '#8f6f73'}
              />

              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>Account Type</Text>
              <View style={styles.typeButtons}>
                {[
                  { value: 'bank' as const, label: 'Checking' },
                  { value: 'debit' as const, label: 'Debit Card' },
                  { value: 'credit' as const, label: 'Credit Card' },
                  { value: 'wallet' as const, label: 'Digital Wallet' },
                  { value: 'cash' as const, label: 'Cash' },
                ].map((type) => (
                  <TouchableOpacity activeOpacity={1}
                    key={type.value}
                    style={[styles.typeButton, newWalletType === type.value && styles.typeButtonActive, isDarkMode && newWalletType !== type.value && styles.typeButtonDark]}
                    onPress={() => setNewWalletType(type.value)}
                  >
                    <Text style={[styles.typeButtonText, newWalletType === type.value && { color: '#fff' }, isDarkMode && newWalletType !== type.value && styles.typeButtonTextDark]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>Initial Balance</Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.inputDark]}
                    value={newWalletBalance}
                    onChangeText={(text) => setNewWalletBalance(formatNumberWithCommas(text))}
                    placeholder="1,500.00"
                    keyboardType="numeric"
                    placeholderTextColor={isDarkMode ? '#7a6f73' : '#8f6f73'}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>Currency</Text>
                  <View style={styles.currencySelector}>
                    {['PHP', 'USD', 'JPY'].map((curr) => (
                      <TouchableOpacity activeOpacity={1}
                        key={curr}
                        style={[
                          styles.currencyOption,
                          newWalletCurrency === curr && styles.currencyOptionActive,
                          isDarkMode && newWalletCurrency !== curr && styles.currencyOptionDark
                        ]}
                        onPress={() => setNewWalletCurrency(curr)}
                      >
                        <Text style={{
                          fontSize: 13,
                          fontWeight: newWalletCurrency === curr ? '600' : '500',
                          color: newWalletCurrency === curr ? '#b80045' : (isDarkMode ? '#9ca3af' : '#9ca3af'),
                          fontFamily: newWalletCurrency === curr ? 'PlusJakartaSans-SemiBold' : 'PlusJakartaSans-Regular'
                        }}>
                          {curr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={[styles.stepTitle, isDarkMode && styles.stepTitleDark]}>Step 3: Card Styling & Palette</Text>
              <Text style={[styles.paletteSubtitle, isDarkMode && styles.paletteSubtitleDark]}>Premium Gradient Collections</Text>
              <View style={styles.colorButtons}>
                {[
                  { name: 'Rose Bloom', gradient: ['#FF6B9D', '#C44569'] },
                  { name: 'Sunset Pink', gradient: ['#FF8C94', '#FF4E6A'] },
                  { name: 'Purple Dream', gradient: ['#A770EF', '#CF5BD3', '#FDB99B'] },
                  { name: 'Orange Burst', gradient: ['#FF8C42', '#FF6F00'] },
                  { name: 'Deep Wine', gradient: ['#C94B4B', '#4B134F'] },
                  { name: 'Midnight Blue', gradient: ['#2C3E50', '#000000'] },
                  { name: 'Ocean Teal', gradient: ['#00D2FF', '#3A7BD5'] },
                  { name: 'Royal Purple', gradient: ['#7F00FF', '#E100FF'] },
                  { name: 'Emerald Green', gradient: ['#56AB2F', '#A8E063'] },
                  { name: 'Gold Luxury', gradient: ['#FFD700', '#FFA500'] },
                  { name: 'Cherry Blossom', gradient: ['#FFB3D9', '#FF69B4'] },
                  { name: 'Arctic Blue', gradient: ['#667EEA', '#764BA2'] },
                ].map((colorOption) => (
                  <TouchableOpacity activeOpacity={1}
                    key={colorOption.name}
                    style={[
                      styles.colorButton,
                      newWalletColor === colorOption.gradient[0] && styles.colorButtonActive
                    ]}
                    onPress={() => {
                      setNewWalletColor(colorOption.gradient[0]);
                      setNewWalletGradient(colorOption.gradient);
                    }}
                  >
                    <LinearGradient
                      colors={colorOption.gradient as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.colorButtonGradient}
                    />
                    {newWalletColor === colorOption.gradient[0] && (
                      <View style={styles.colorCheck}>
                        <Text style={styles.colorCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {editingAccount && (
                <TouchableOpacity activeOpacity={1}
                  style={[styles.deleteWalletButton, isDarkMode && styles.deleteWalletButtonDark]}
                  onPress={() => {
                    closeWalletModal();
                    deleteWallet(editingAccount.id);
                  }}
                >
                  <Trash2 size={18} color="#ba1a1a" />
                  <Text style={[styles.deleteWalletText, isDarkMode && styles.deleteWalletTextDark]}>Delete Wallet</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={showAddTransaction} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
              <TouchableOpacity activeOpacity={1} onPress={() => {
                setShowAddTransaction(false);
                setNewTransactionAmount('');
                setNewTransactionMerchant('');
                setNewTransactionAccount(null);
              }}>
                <X size={24} color={isDarkMode ? '#e8d0d3' : '#1c1b22'} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>Log Transaction</Text>
              <TouchableOpacity activeOpacity={1} onPress={addTransaction}>
                <Text style={[styles.modalSave, isDarkMode && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Type Pills */}
              <View style={styles.transactionTypePills}>
                {(['expense', 'income', 'transfer'] as const).map((type) => (
                  <TouchableOpacity activeOpacity={1}
                    key={type}
                    style={[styles.transactionTypePill, newTransactionType === type && styles.transactionTypePillActive, isDarkMode && newTransactionType !== type && styles.transactionTypePillDark]}
                    onPress={() => setNewTransactionType(type)}
                  >
                    <Text style={[styles.transactionTypePillText, newTransactionType === type && { color: '#fff' }, isDarkMode && newTransactionType !== type && styles.transactionTypePillTextDark]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount Input */}
              <View style={styles.amountSection}>
                <Text style={[styles.amountLabel, isDarkMode && styles.amountLabelDark]}>LOGGING {newTransactionType.toUpperCase()}</Text>
                <TextInput
                  style={[styles.amountInput, isDarkMode && styles.amountInputDark]}
                  value={newTransactionAmount}
                  onChangeText={(text) => setNewTransactionAmount(formatNumberWithCommas(text))}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#e3bdc1"
                />
                <Text style={[styles.amountHint, isDarkMode && styles.amountHintDark]}>Tap to edit amount</Text>
              </View>

              {/* Account Selection */}
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>
                {newTransactionType === 'transfer' ? 'FROM ACCOUNT' : 'DEBIT SOURCE'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelection}>
                {accounts.map((account) => (
                  <TouchableOpacity activeOpacity={1}
                    key={account.id}
                    style={[
                      styles.accountChip,
                      newTransactionAccount === account.id && styles.accountChipActive,
                      isDarkMode && newTransactionAccount !== account.id && styles.accountChipDark
                    ]}
                    onPress={() => setNewTransactionAccount(account.id)}
                  >
                    <View style={[styles.accountChipIcon, { backgroundColor: account.color }]}>
                      {account.type === 'bank' && <Building2 size={16} color="#fff" />}
                      {account.type === 'debit' && <CreditCard size={16} color="#fff" />}
                      {account.type === 'wallet' && <Smartphone size={16} color="#fff" />}
                      {account.type === 'cash' && <HandCoins size={16} color="#fff" />}
                      {account.type === 'credit' && <CreditCard size={16} color="#fff" />}
                    </View>
                    <Text style={[styles.accountChipName, isDarkMode && newTransactionAccount !== account.id && styles.accountChipNameDark]}>{account.name}</Text>
                    <Text style={[styles.accountChipLast, isDarkMode && newTransactionAccount !== account.id && styles.accountChipLastDark]}>•••• {account.lastFour}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Available Balance Display */}
              {newTransactionAccount && (newTransactionType === 'expense' || newTransactionType === 'transfer') && (
                <View style={styles.availableBalanceContainer}>
                  <Text style={[styles.availableBalanceText, isDarkMode && styles.availableBalanceTextDark]}>
                    Available: {getCurrencySymbol(accounts.find(a => a.id === newTransactionAccount)?.currency || 'PHP')}
                    {formatAmount(accounts.find(a => a.id === newTransactionAccount)?.balance || 0)}
                  </Text>
                </View>
              )}

              {/* Transfer To Account (only show for transfers) */}
              {newTransactionType === 'transfer' && (
                <>
                  <View style={styles.transferArrow}>
                    <ArrowDown size={24} color="#b80045" />
                  </View>
                  <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>TO ACCOUNT</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelection}>
                    {accounts
                      .filter(acc => acc.id !== newTransactionAccount)
                      .map((account) => (
                        <TouchableOpacity activeOpacity={1}
                          key={account.id}
                          style={[
                            styles.accountChip,
                            newTransactionToAccount === account.id && styles.accountChipActive,
                            isDarkMode && newTransactionToAccount !== account.id && styles.accountChipDark
                          ]}
                          onPress={() => setNewTransactionToAccount(account.id)}
                        >
                          <View style={[styles.accountChipIcon, { backgroundColor: account.color }]}>
                            {account.type === 'bank' && <Building2 size={16} color="#fff" />}
                            {account.type === 'wallet' && <Smartphone size={16} color="#fff" />}
                            {account.type === 'cash' && <HandCoins size={16} color="#fff" />}
                            {account.type === 'credit' && <CreditCard size={16} color="#fff" />}
                          </View>
                          <Text style={[styles.accountChipName, isDarkMode && newTransactionToAccount !== account.id && styles.accountChipNameDark]}>{account.name}</Text>
                          <Text style={[styles.accountChipLast, isDarkMode && newTransactionToAccount !== account.id && styles.accountChipLastDark]}>•••• {account.lastFour}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </>
              )}

              {/* Category Selection */}
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {Object.entries(categoryIcons).map(([cat, Icon]) => (
                  <TouchableOpacity activeOpacity={1}
                    key={cat}
                    style={[
                      styles.categoryBox,
                      newTransactionCategory === cat && styles.categoryBoxActive,
                      isDarkMode && newTransactionCategory !== cat && styles.categoryBoxDark
                    ]}
                    onPress={() => setNewTransactionCategory(cat)}
                  >
                    <View style={[
                      styles.categoryIcon,
                      newTransactionCategory === cat && { backgroundColor: '#b80045' }
                    ]}>
                      <Icon size={20} color={newTransactionCategory === cat ? '#fff' : '#b80045'} />
                    </View>
                    <Text style={[styles.categoryLabel, isDarkMode && newTransactionCategory !== cat && styles.categoryLabelDark]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date & Time */}
              <View style={styles.dateTimeSection}>
                <CalendarIcon size={20} color="#b80045" />
                <View style={[styles.dateTimeInfo, isDarkMode && styles.dateTimeInfoDark]}>
                  <Text style={[styles.dateTimeLabel, isDarkMode && styles.dateTimeLabelDark]}>DATE & TIME</Text>
                  <Text style={[styles.dateTimeValue, isDarkMode && styles.dateTimeValueDark]}>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>

              {/* Merchant / Note */}
              <View style={styles.merchantSection}>
                <Store size={20} color={isDarkMode ? '#9a8a8d' : '#5b4043'} />
                <View style={[styles.merchantInfo, isDarkMode && styles.merchantInfoDark]}>
                  <Text style={[styles.merchantLabel, isDarkMode && styles.merchantLabelDark]}>MERCHANT / NOTE</Text>
                  <TextInput
                    style={[styles.merchantInput, isDarkMode && styles.merchantInputDark]}
                    value={newTransactionMerchant}
                    onChangeText={setNewTransactionMerchant}
                    placeholder="e.g., Whole Foods Market"
                    placeholderTextColor={isDarkMode ? '#7a6f73' : '#8f6f73'}
                  />
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            <TouchableOpacity activeOpacity={1} style={[styles.saveTransactionButton, isDarkMode && styles.saveTransactionButtonDark]} onPress={addTransaction}>
              <Text style={styles.saveTransactionText}>💾 Save Transaction</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal visible={showAddReminder} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
              <TouchableOpacity activeOpacity={1} onPress={() => setShowAddReminder(false)}>
                <X size={24} color={isDarkMode ? '#e8d0d3' : '#1c1b22'} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>New Reminder</Text>
              <TouchableOpacity activeOpacity={1} onPress={addReminder}>
                <Text style={[styles.modalSave, isDarkMode && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Reminder Name */}
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>REMINDER NAME</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                value={newReminderName}
                onChangeText={setNewReminderName}
                placeholder="e.g., Netflix Premium"
                placeholderTextColor="#e3bdc1"
              />

              {/* Amount */}
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>AMOUNT</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                value={newReminderAmount}
                onChangeText={(text) => setNewReminderAmount(formatNumberWithCommas(text))}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#e3bdc1"
              />

              {/* Due Date (Calendar Picker) */}
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>DUE DATE</Text>
              
              {/* Month/Year Quick Jump */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowMonthYearPicker(!showMonthYearPicker)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: isDarkMode ? '#2a2831' : '#fff',
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: isDarkMode ? '#3d3846' : '#e3bdc1',
                  }}
                >
                  <Text style={{ 
                    fontFamily: 'PlusJakartaSans-SemiBold', 
                    fontSize: 14,
                    color: isDarkMode ? '#e8d0d3' : '#1c1b22'
                  }}>
                    {showMonthYearPicker ? 'Close Picker' : 'Jump to Month/Year'}
                  </Text>
                  <CalendarIcon size={18} color="#b80045" />
                </TouchableOpacity>
              </View>

              {/* Month/Year Picker Grid */}
              {showMonthYearPicker && (
                <View style={{
                  backgroundColor: isDarkMode ? '#2a2831' : '#fff',
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: isDarkMode ? '#3d3846' : '#e3bdc1',
                  padding: 16,
                  marginBottom: 8,
                }}>
                  <Text style={{ 
                    fontFamily: 'PlusJakartaSans-Bold', 
                    fontSize: 12,
                    color: isDarkMode ? '#e8d0d3' : '#5b4043',
                    marginBottom: 12,
                    letterSpacing: 0.5,
                  }}>SELECT YEAR</Text>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {Array.from({ length: 10 }, (_, i) => 2026 + i).map((year) => (
                        <TouchableOpacity
                          key={year}
                          activeOpacity={0.7}
                          onPress={() => {
                            const currentDate = new Date(calendarDate);
                            currentDate.setFullYear(year);
                            const newDate = currentDate.toISOString().split('T')[0];
                            setCalendarDate(newDate);
                          }}
                          style={{
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            backgroundColor: new Date(calendarDate).getFullYear() === year ? '#b80045' : (isDarkMode ? '#1c1b22' : '#f8f4f5'),
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: new Date(calendarDate).getFullYear() === year ? '#b80045' : (isDarkMode ? '#3d3846' : '#e3bdc1'),
                          }}
                        >
                          <Text style={{
                            fontFamily: 'PlusJakartaSans-SemiBold',
                            fontSize: 14,
                            color: new Date(calendarDate).getFullYear() === year ? '#fff' : (isDarkMode ? '#e8d0d3' : '#1c1b22'),
                          }}>{year}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <Text style={{ 
                    fontFamily: 'PlusJakartaSans-Bold', 
                    fontSize: 12,
                    color: isDarkMode ? '#e8d0d3' : '#5b4043',
                    marginBottom: 12,
                    letterSpacing: 0.5,
                  }}>SELECT MONTH</Text>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                      const monthNum = idx + 1;
                      const currentDate = new Date(calendarDate);
                      const isSelected = currentDate.getMonth() === idx;
                      
                      return (
                        <TouchableOpacity
                          key={month}
                          activeOpacity={0.7}
                          onPress={() => {
                            const newDate = new Date(currentDate.getFullYear(), idx, 1);
                            setCalendarDate(newDate.toISOString().split('T')[0]);
                          }}
                          style={{
                            width: '22%',
                            paddingVertical: 12,
                            backgroundColor: isSelected ? '#b80045' : (isDarkMode ? '#1c1b22' : '#f8f4f5'),
                            borderRadius: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: isSelected ? '#b80045' : (isDarkMode ? '#3d3846' : '#e3bdc1'),
                          }}
                        >
                          <Text style={{
                            fontFamily: 'PlusJakartaSans-SemiBold',
                            fontSize: 13,
                            color: isSelected ? '#fff' : (isDarkMode ? '#e8d0d3' : '#1c1b22'),
                          }}>{month}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              
              <Calendar
                current={calendarDate}
                minDate={new Date().toISOString().split('T')[0]}
                maxDate={'2035-12-31'}
                enableSwipeMonths={true}
                hideExtraDays={true}
                onDayPress={(day) => {
                  setNewReminderDueDate(day.dateString);
                  setCalendarDate(day.dateString);
                }}
                markedDates={{
                  [newReminderDueDate]: { selected: true, selectedColor: '#b80045' }
                }}
                monthFormat={'MMMM yyyy'}
                onMonthChange={(month) => {
                  setCalendarDate(month.dateString);
                }}
                hideArrows={false}
                renderArrow={(direction) => {
                  return direction === 'left' ? (
                    <Text style={{ color: '#b80045', fontSize: 20 }}>‹</Text>
                  ) : (
                    <Text style={{ color: '#b80045', fontSize: 20 }}>›</Text>
                  );
                }}
                disableMonthChange={false}
                firstDay={0}
                onPressArrowLeft={subtractMonth => subtractMonth()}
                onPressArrowRight={addMonth => addMonth()}
                disableAllTouchEventsForDisabledDays={true}
                theme={{
                  backgroundColor: isDarkMode ? '#2a2831' : '#ffffff',
                  calendarBackground: isDarkMode ? '#2a2831' : '#ffffff',
                  textSectionTitleColor: isDarkMode ? '#e8d0d3' : '#5b4043',
                  selectedDayBackgroundColor: '#b80045',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#b80045',
                  dayTextColor: isDarkMode ? '#e8d0d3' : '#1c1b22',
                  textDisabledColor: isDarkMode ? '#3d3846' : '#e3bdc1',
                  monthTextColor: isDarkMode ? '#e8d0d3' : '#1c1b22',
                  arrowColor: '#b80045',
                  textDayFontFamily: 'PlusJakartaSans-Regular',
                  textMonthFontFamily: 'PlusJakartaSans-Bold',
                  textDayHeaderFontFamily: 'PlusJakartaSans-SemiBold',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
                style={{
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: isDarkMode ? '#3d3846' : '#e3bdc1',
                  marginBottom: 8,
                  paddingBottom: 10,
                }}
              />
              {newReminderDueDate && (
                <Text style={[styles.inputHint, isDarkMode && styles.inputHintDark]}>
                  Selected: {new Date(newReminderDueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              )}

              {/* Category */}
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>CATEGORY</Text>
              <View style={styles.categoryPills}>
                {(['subscription', 'utility', 'rent', 'lifestyle', 'other'] as const).map((cat) => (
                  <TouchableOpacity activeOpacity={1}
                    key={cat}
                    style={[
                      styles.categoryPill,
                      newReminderCategory === cat && styles.categoryPillActive,
                      isDarkMode && newReminderCategory !== cat && styles.categoryPillDark
                    ]}
                    onPress={() => setNewReminderCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryPillText,
                      newReminderCategory === cat && styles.categoryPillTextActive,
                      isDarkMode && newReminderCategory !== cat && styles.categoryPillTextDark
                    ]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Account Selection */}
              <Text style={[styles.inputLabel, isDarkMode && styles.inputLabelDark]}>PAYMENT ACCOUNT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelection}>
                {accounts.map((account) => (
                  <TouchableOpacity activeOpacity={1}
                    key={account.id}
                    style={[
                      styles.accountChip,
                      newReminderAccount === account.id && styles.accountChipActive,
                      isDarkMode && newReminderAccount !== account.id && styles.accountChipDark
                    ]}
                    onPress={() => setNewReminderAccount(account.id)}
                  >
                    <View style={[styles.accountChipIcon, { backgroundColor: account.color }]}>
                      {account.type === 'bank' && <Building2 size={16} color="#fff" />}
                      {account.type === 'debit' && <CreditCard size={16} color="#fff" />}
                      {account.type === 'wallet' && <Smartphone size={16} color="#fff" />}
                      {account.type === 'cash' && <HandCoins size={16} color="#fff" />}
                      {account.type === 'credit' && <CreditCard size={16} color="#fff" />}
                    </View>
                    <Text style={[styles.accountChipName, isDarkMode && newReminderAccount !== account.id && styles.accountChipNameDark]}>{account.name}</Text>
                    <Text style={[styles.accountChipLast, isDarkMode && newReminderAccount !== account.id && styles.accountChipLastDark]}>•••• {account.lastFour}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Auto-Renew Toggle */}
              <View style={styles.toggleRow}>
                <View>
                  <Text style={[styles.toggleLabel, isDarkMode && styles.textDark]}>Auto-Renew</Text>
                  <Text style={[styles.toggleSubtext, isDarkMode && styles.textSecondaryDark]}>Automatically recurring payment</Text>
                </View>
                <TouchableOpacity activeOpacity={1}
                  onPress={() => setNewReminderAutoRenew(!newReminderAutoRenew)}
                  style={[styles.toggle, newReminderAutoRenew && styles.toggleActive]}
                >
                  <View style={[styles.toggleActive]} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Action Menu Modal */}
      <Modal visible={showActionMenu} animationType="fade" transparent>
        <TouchableOpacity activeOpacity={1}
          style={styles.actionMenuOverlay}
          
          onPress={() => setShowActionMenu(false)}
        >
          <View style={[styles.actionMenuContent, isDarkMode && styles.actionMenuContentDark]}>
            <Text style={[styles.actionMenuTitle, isDarkMode && { color: '#e8d0d3' }]}>What do you want to do?</Text>
            
            <TouchableOpacity activeOpacity={1}
              style={[styles.actionMenuItem, isDarkMode && styles.actionMenuItemDark]}
              onPress={() => {
                setShowActionMenu(false);
                setShowAddWallet(true);
              }}
            >
              <View style={styles.actionMenuIconContainer}>
                <Wallet size={24} color="#b80045" />
              </View>
              <View style={styles.actionMenuTextContainer}>
                <Text style={[styles.actionMenuItemTitle, isDarkMode && styles.actionMenuItemTextDark]}>Add Wallet</Text>
                <Text style={[styles.actionMenuItemSubtitle, isDarkMode && { color: '#9a8a8d' }]}>Create a new bank account or wallet</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={1}
              style={[styles.actionMenuItem, isDarkMode && styles.actionMenuItemDark]}
              onPress={() => {
                setShowActionMenu(false);
                setShowAddTransaction(true);
              }}
            >
              <View style={styles.actionMenuIconContainer}>
                <Receipt size={24} color="#b80045" />
              </View>
              <View style={styles.actionMenuTextContainer}>
                <Text style={[styles.actionMenuItemTitle, isDarkMode && styles.actionMenuItemTextDark]}>Log Transaction</Text>
                <Text style={[styles.actionMenuItemSubtitle, isDarkMode && { color: '#9a8a8d' }]}>Record an expense, income, or transfer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={1}
              style={[styles.actionMenuItem, isDarkMode && styles.actionMenuItemDark]}
              onPress={() => {
                setShowActionMenu(false);
                setShowAddReminder(true);
              }}
            >
              <View style={styles.actionMenuIconContainer}>
                <Bell size={24} color="#b80045" />
              </View>
              <View style={styles.actionMenuTextContainer}>
                <Text style={[styles.actionMenuItemTitle, isDarkMode && styles.actionMenuItemTextDark]}>Add Reminder</Text>
                <Text style={[styles.actionMenuItemSubtitle, isDarkMode && { color: '#9a8a8d' }]}>Set up recurring monthly payment reminder</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={1}
              style={[styles.actionMenuItem, styles.actionMenuItemLast, isDarkMode && styles.actionMenuItemDark]}
              onPress={() => setShowActionMenu(false)}
            >
              <View style={styles.actionMenuIconContainer}>
                <X size={24} color={isDarkMode ? '#9a8a8d' : '#5b4043'} />
              </View>
              <View style={styles.actionMenuTextContainer}>
                <Text style={[styles.actionMenuItemTitle, isDarkMode && styles.actionMenuItemTextDark]}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fcf8ff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1ecf6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e3bdc1',
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'JetBrainsMono-Bold',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f6f2fc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b80045',
    borderWidth: 2,
    borderColor: '#f6f2fc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e3bdc1',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'JetBrainsMono-Bold',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006947',
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#b80045',
    marginRight: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'JetBrainsMono-Bold',
  },
  summaryPills: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e3bdc1',
    paddingTop: 16,
  },
  summaryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf8ff',
    borderRadius: 16,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
    textTransform: 'uppercase',
    fontFamily: 'JetBrainsMono-Bold',
  },
  summaryAmountPositive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#006947',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  summaryAmountNegative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b80045',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: -0.2,
  },
  activeBadge: {
    backgroundColor: '#ffd9dd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#910034',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#b80045',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  walletScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  walletCard: {
    width: 300,
    height: 180,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
  },
  walletCardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  walletCardShine: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '25deg' }],
  },
  walletCardEditButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInstitutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  walletInstitution: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  walletDebitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  walletDebitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  walletChipContainer: {
    paddingLeft: 10,
  },
  walletChip: {
    width: 45,
    height: 36,
    margin: -3,
  },
  chipImage: {
    width: '100%',
    height: '100%',
  },
  walletCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  walletNicknameLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  walletNickname: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  walletLastFour: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    fontFamily: 'JetBrainsMono-Regular',
  },
  walletBalanceContainer: {
    alignItems: 'flex-end',
  },
  walletBalanceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'JetBrainsMono-Bold',
  },
  emptyWallets: {
    width: 300,
    height: 180,
    borderRadius: 24,
    backgroundColor: '#f6f2fc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e3bdc1',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  transactionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDeleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffdad6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  transactionDetails: {
    fontSize: 12,
    color: '#5b4043',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  transactionRight: {
    alignItems: 'flex-end',
    paddingLeft: 8,
    width: 105,
    flexShrink: 0,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  transactionAmountPositive: {
    color: '#006947',
  },
  transactionAmountNegative: {
    color: '#ba1a1a',
  },
  transactionTime: {
    fontSize: 10,
    color: '#5b4043',
    marginTop: 2,
  },
  emptyTransactions: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyButton: {
    backgroundColor: '#b80045',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b80045',
  },
  emptyPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  txGroup: {
    marginBottom: 18,
  },
  txGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8f6f73',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  emptyPageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1b22',
    marginTop: 16,
  },
  emptyPageText: {
    fontSize: 14,
    color: '#5b4043',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#b80045',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  emptyPageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  walletListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3bdc1',
    gap: 12,
  },
  walletListIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletListInfo: {
    flex: 1,
  },
  walletListName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  walletListDetails: {
    fontSize: 12,
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  walletListBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'JetBrainsMono-Bold',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  settingsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8f6f73',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  settingsSectionTitleDark: {
    color: '#9a8a8d',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e3bdc1',
    overflow: 'hidden',
  },
  settingsCardDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingsRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1ecf6',
  },
  settingsRowBorderDark: {
    borderTopColor: '#3d3846',
  },
  settingsRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  settingsRowSubtitle: {
    fontSize: 12,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffd9dd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconCircleDark: {
    backgroundColor: '#3d3846',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e3bdc1',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffd9dd',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#b80045',
  },
  profileAvatarDark: {
    backgroundColor: '#3d3846',
    borderColor: '#b80045',
  },
  profileStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#006947',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  profileEmail: {
    fontSize: 12,
    color: '#8f6f73',
    fontFamily: 'JetBrainsMono-Regular',
    marginTop: 2,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1ecf6',
  },
  profileStatPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8f4f5',
  },
  profileStatPillDark: {
    backgroundColor: '#1c1b22',
  },
  profileStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8f6f73',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  profileStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c1b22',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    padding: 4,
    backgroundColor: '#f1ecf6',
    borderRadius: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: '#b80045',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  themeOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  themeOptionTextActive: {
    color: '#fff',
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f1ecf6',
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  currencyBadgeDark: {
    backgroundColor: '#3d3846',
    borderColor: '#3d3846',
  },
  walletIconsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    alignItems: 'center',
  },
  walletIconMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1ecf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconMiniDark: {
    backgroundColor: '#3d3846',
  },
  walletIconMiniText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#b80045',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'flex-end',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  exportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#f1ecf6',
  },
  exportBadgeDark: {
    backgroundColor: '#3d3846',
  },
  exportBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#5b4043',
    fontFamily: 'JetBrainsMono-Regular',
  },
  appInfoFooter: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 16,
  },
  appInfoText: {
    fontSize: 12,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#b80045',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b80045',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  // Login Screen Styles
  ambientGlow1: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 107, 139, 0.15)',
    opacity: 0.6,
  },
  ambientGlow2: {
    position: 'absolute',
    top: '33%',
    left: -96,
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: 'rgba(255, 107, 139, 0.12)',
    opacity: 0.4,
  },
  loginHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  loginHeaderButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b80045',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  loginBrandSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loginLogoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  loginLogo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  loginSecureBadge: {
    position: 'absolute',
    bottom: -8,
    right: -4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3bdc1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginSecureText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#b80045',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1c1b22',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: -0.5,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
    marginBottom: 16,
  },
  loginWelcomeBanner: {
    backgroundColor: 'rgba(255, 107, 139, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 139, 0.15)',
  },
  loginWelcomeBannerDark: {
    backgroundColor: 'rgba(255, 107, 139, 0.12)',
    borderColor: 'rgba(255, 107, 139, 0.2)',
  },
  loginWelcomeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b80045',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  loginFormCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 139, 0.12)',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  loginFormCardDark: {
    backgroundColor: 'rgba(42, 40, 49, 0.95)',
    borderColor: '#3d3846',
  },
  loginFormTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  loginInputContainer: {
    marginBottom: 16,
  },
  loginInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1c1b22',
    borderWidth: 1.5,
    borderColor: '#e3bdc1',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  loginInputDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
    color: '#e8d0d3',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  loginToggleButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loginToggleText: {
    fontSize: 14,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  loginToggleTextBold: {
    fontWeight: '700',
    color: '#b80045',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  loginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  loginDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e3bdc1',
  },
  loginDividerLineDark: {
    backgroundColor: '#3d3846',
  },
  loginDividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e3bdc1',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  socialButtonDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  socialButtonIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b80045',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  biometricSetupIcon: {
    alignItems: 'center',
    marginVertical: 24,
  },
  biometricSetupTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1b22',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  biometricSetupText: {
    fontSize: 14,
    color: '#8f6f73',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  biometricSetupButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  biometricSetupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  biometricSetupSkip: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  biometricSetupSkipText: {
    fontSize: 14,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f4f5',
    marginBottom: 8,
  },
  currencyOptionActive: {
    backgroundColor: '#ffd9dd',
    borderWidth: 2,
    borderColor: '#b80045',
  },
  currencyOptionDark: {
    backgroundColor: '#2a2831',
  },
  currencyOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  currencyOptionSymbol: {
    fontSize: 13,
    color: '#8f6f73',
    fontFamily: 'JetBrainsMono-Regular',
  },
  currencyCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#b80045',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyCheckText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  settingsItem: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e3bdc1',
  },
  settingsItemText: {
    fontSize: 16,
    color: '#1c1b22',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 4,
  },
  navItemActive: {
    backgroundColor: '#ffd9dd',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
  },
  navLabelActive: {
    color: '#b80045',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fcf8ff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e3bdc1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b80045',
  },
  modalBody: {
    padding: 20,
  },
  cardPreviewSection: {
    marginBottom: 24,
  },
  cardPreviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardPreviewContainer: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardPreview: {
    height: 180,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreviewInstitution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cardPreviewInstitutionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
  },
  cardPreviewDebit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardPreviewDebitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardPreviewChip: {
    width: 54,
    height: 43,
    margin: -4,
  },
  cardPreviewChipContainer: {
    paddingLeft: 3,
  },
  chipImagePreview: {
    width: '100%',
    height: '100%',
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewNicknameLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardPreviewNickname: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cardPreviewBalanceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'right',
  },
  cardPreviewBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1b22',
    marginTop: 24,
    marginBottom: 16,
  },
  institutionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  institutionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  institutionButtonActive: {
    backgroundColor: '#b80045',
    borderColor: '#b80045',
  },
  institutionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e3bdc1',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1c1b22',
  },
  inputHint: {
    fontSize: 12,
    color: '#8f6f73',
    marginTop: 6,
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  inputHintDark: {
    color: '#9a8a8d',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  typeButtonActive: {
    backgroundColor: '#b80045',
    borderColor: '#b80045',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  inputHalf: {
    flex: 1,
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  colorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  colorButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
  },
  colorButtonActive: {
    borderColor: '#1c1b22',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  paletteSubtitle: {
    fontSize: 12,
    color: '#8f6f73',
    marginTop: 4,
    fontStyle: 'italic',
  },
  colorCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheckText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  deleteWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ba1a1a',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
  },
  deleteWalletText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ba1a1a',
  },
  transactionTypePills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  transactionTypePill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3bdc1',
    alignItems: 'center',
  },
  transactionTypePillActive: {
    backgroundColor: '#b80045',
    borderColor: '#b80045',
  },
  transactionTypePillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1b22',
  },
  amountSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b80045',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1c1b22',
    textAlign: 'center',
    padding: 0,
    minWidth: 200,
    fontFamily: 'JetBrainsMono-Bold',
  },
  amountHint: {
    fontSize: 12,
    color: '#8f6f73',
    marginTop: 4,
  },
  accountSelection: {
    marginTop: 8,
    marginBottom: 16,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e3bdc1',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    gap: 8,
  },
  accountChipActive: {
    backgroundColor: '#ffd9dd',
    borderColor: '#b80045',
    borderWidth: 2,
  },
  accountChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountChipName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
  },
  accountChipLast: {
    fontSize: 12,
    color: '#5b4043',
  },
  availableBalanceContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  availableBalanceText: {
    fontSize: 12,
    color: '#b80045',
    fontWeight: '500',
  },
  availableBalanceTextDark: {
    color: '#ff6b9d',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  categoryBox: {
    width: '22%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e3bdc1',
    gap: 8,
  },
  categoryBoxActive: {
    backgroundColor: '#ffd9dd',
    borderColor: '#b80045',
    borderWidth: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffd9dd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1c1b22',
    textAlign: 'center',
  },
  dateTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
  },
  merchantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5b4043',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  merchantInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1b22',
    padding: 0,
  },
  saveTransactionButton: {
    backgroundColor: '#b80045',
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveTransactionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  transferArrow: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#b80045',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  actionMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionMenuContent: {
    backgroundColor: '#fcf8ff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  actionMenuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1b22',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  actionMenuItemLast: {
    marginBottom: 0,
  },
  actionMenuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffd9dd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionMenuTextContainer: {
    flex: 1,
  },
  actionMenuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 2,
  },
  actionMenuItemSubtitle: {
    fontSize: 12,
    color: '#5b4043',
  },
  // Dark Mode Styles
  containerDark: {
    backgroundColor: '#1c1b22',
  },
  headerDark: {
    backgroundColor: '#1c1b22',
  },
  avatarDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  iconButtonDark: {
    backgroundColor: '#312f37',
  },
  textDark: {
    color: '#e3bdc1',
  },
  textSecondaryDark: {
    color: '#8f6f73',
  },
  textMutedDark: {
    color: '#9a8a8d',
  },
  balanceCardDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  summaryPillDark: {
    backgroundColor: '#1c1b22',
    borderColor: '#5b4043',
  },
  transactionItemDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  contentDark: {
    backgroundColor: '#1c1b22',
  },
  pageHeaderDark: {
    borderBottomColor: '#5b4043',
  },
  sectionDark: {
    backgroundColor: '#1c1b22',
  },
  emptyPageDark: {
    backgroundColor: '#1c1b22',
  },
  emptyPageTitleDark: {
    color: '#e3bdc1',
  },
  emptyPageTextDark: {
    color: '#8f6f73',
  },
  emptyTextDark: {
    color: '#8f6f73',
  },
  emptyTransactionsDark: {
    backgroundColor: '#1c1b22',
  },
  viewAllTextDark: {
    color: '#ff6b9d',
  },
  settingsSectionDark: {
    borderBottomColor: '#5b4043',
  },
  settingsItemDark: {
    borderBottomColor: '#5b4043',
  },
  settingsItemTextDark: {
    color: '#e3bdc1',
  },
  bottomNavDark: {
    backgroundColor: '#1c1b22',
    borderTopColor: '#5b4043',
  },
  navItemActiveDark: {
    backgroundColor: '#312f37',
  },
  modalContentDark: {
    backgroundColor: '#1c1b22',
  },
  modalHeaderDark: {
    borderBottomColor: '#5b4043',
  },
  modalTitleDark: {
    color: '#e3bdc1',
  },
  modalSaveDark: {
    color: '#ff6b9d',
  },
  inputDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
    color: '#e3bdc1',
  },
  inputLabelDark: {
    color: '#8f6f73',
  },
  accountChipDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  accountChipActiveDark: {
    backgroundColor: '#b80045',
    borderColor: '#b80045',
  },
  accountChipNameDark: {
    color: '#e3bdc1',
  },
  accountChipLastDark: {
    color: '#8f6f73',
  },
  transactionTypePillDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  transactionTypePillActiveDark: {
    backgroundColor: '#b80045',
    borderColor: '#b80045',
  },
  transactionTypePillTextDark: {
    color: '#e3bdc1',
  },
  amountInputDark: {
    color: '#e3bdc1',
  },
  amountLabelDark: {
    color: '#8f6f73',
  },
  amountHintDark: {
    color: '#8f6f73',
  },
  institutionButtonDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  institutionButtonTextDark: {
    color: '#e3bdc1',
  },
  typeButtonDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  typeButtonTextDark: {
    color: '#e3bdc1',
  },
  stepTitleDark: {
    color: '#e3bdc1',
  },
  paletteSubtitleDark: {
    color: '#8f6f73',
  },
  cardPreviewLabelDark: {
    color: '#8f6f73',
  },
  categoryBoxDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  categoryLabelDark: {
    color: '#e3bdc1',
  },
  dateTimeInfoDark: {},
  dateTimeValueDark: {
    color: '#e3bdc1',
  },
  dateTimeLabelDark: {
    color: '#8f6f73',
  },
  merchantInfoDark: {},
  merchantInputDark: {
    color: '#e3bdc1',
    borderColor: '#5b4043',
  },
  merchantLabelDark: {
    color: '#8f6f73',
  },
  actionMenuContentDark: {
    backgroundColor: '#1c1b22',
  },
  actionMenuItemDark: {
    borderBottomColor: '#5b4043',
  },
  actionMenuItemTextDark: {
    color: '#e3bdc1',
  },
  saveTransactionButtonDark: {
    backgroundColor: '#b80045',
  },
  deleteWalletButtonDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  deleteWalletTextDark: {
    color: '#ff6b9d',
  },
  notificationDotDark: {
    backgroundColor: '#ff6b9d',
  },
  emptyWalletsDark: {
    backgroundColor: '#312f37',
    borderColor: '#5b4043',
  },
  emptySubtextDark: {
    color: '#8f6f73',
  },
  // Onboarding Styles
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#fcf8ff',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingIcon: {
    fontSize: 80,
    marginBottom: 30,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1b22',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  onboardingDescription: {
    fontSize: 16,
    color: '#5b4043',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  onboardingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
  },
  onboardingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e3bdc1',
  },
  onboardingDotActive: {
    width: 24,
    backgroundColor: '#b80045',
  },
  onboardingButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  onboardingButtonPrimary: {
    flex: 1,
    backgroundColor: '#b80045',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  onboardingButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  onboardingButtonSecondary: {
    flex: 1,
    backgroundColor: '#f6f2fc',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  onboardingButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b80045',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  onboardingSkip: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  onboardingSkipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  // Skeleton Loader Styles
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonText: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonBalanceCard: {
    height: 180,
    borderRadius: 24,
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonWalletCard: {
    width: 300,
    height: 180,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonTransaction: {
    height: 70,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  skeletonNavItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
  },
  skeletonDark: {
    backgroundColor: '#312f37',
  },
  skeletonShimmer: {
    width: '100%',
    height: '100%',
  },
  // Interactive Guide Styles
  guideOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  guideDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  guideContentCentered: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 20,
    alignItems: 'center',
  },
  guideIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  guideSpotlightFab: {
    display: 'none',
  },
  guideSpotlightHeader: {
    display: 'none',
  },
  guideSpotlightNav: {
    display: 'none',
  },
  guideSpotlightCircle: {
    display: 'none',
  },
  guideContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
    zIndex: 20,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1b22',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  guideDescription: {
    fontSize: 15,
    color: '#5b4043',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  guideDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  guideDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e3bdc1',
  },
  guideDotActive: {
    width: 20,
    backgroundColor: '#b80045',
  },
  guideButtons: {
    gap: 8,
  },
  guideButtonPrimary: {
    backgroundColor: '#b80045',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  guideButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  guideSkipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8f6f73',
    textAlign: 'center',
    paddingVertical: 8,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  // Reminder Styles
  commitmentCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commitmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  commitmentCycle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  commitmentAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 4,
  },
  commitmentSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  commitmentProgress: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  commitmentProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  commitmentStats: {
    flexDirection: 'row',
    gap: 12,
  },
  commitmentStat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  commitmentStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  commitmentStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'JetBrainsMono-Bold',
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3bdc1',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#b80045',
    borderColor: '#b80045',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterChipDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  filterChipTextDark: {
    color: '#e8d0d3',
  },
  reminderSection: {
    marginBottom: 24,
  },
  reminderSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reminderSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1b22',
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: -0.2,
  },
  reminderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffd9dd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b80045',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3bdc1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderCardDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  reminderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reminderCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  reminderCardRight: {
    alignItems: 'flex-end',
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1b22',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  reminderDueDate: {
    fontSize: 13,
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  reminderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'JetBrainsMono-Bold',
  },
  reminderFrequency: {
    fontSize: 11,
    color: '#8f6f73',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  reminderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1ecf6',
    marginBottom: 12,
  },
  reminderMetaLeft: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  reminderMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1ecf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reminderMetaText: {
    fontSize: 11,
    color: '#5b4043',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  reminderAutoRenew: {
    backgroundColor: '#E8F5F0',
  },
  reminderAutoRenewText: {
    fontSize: 11,
    color: '#006947',
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderActionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f1ecf6',
    paddingVertical: 10,
    borderRadius: 12,
  },
  reminderActionSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  reminderActionPrimary: {
    flex: 1,
    backgroundColor: '#b80045',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b80045',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderActionPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  reminderListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  reminderListItemDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  reminderListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reminderListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderListName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  reminderListDate: {
    fontSize: 12,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  reminderListAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'JetBrainsMono-Bold',
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6ffbbe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIconText: {
    fontSize: 12,
    color: '#006947',
    fontWeight: '700',
  },
  completedCount: {
    fontSize: 14,
    color: '#8f6f73',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e3bdc1',
  },
  completedItemDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  completedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  completedItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  completedItemDate: {
    fontSize: 12,
    color: '#006947',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  completedItemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1b22',
    fontFamily: 'JetBrainsMono-Bold',
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e3bdc1',
  },
  categoryPillActive: {
    backgroundColor: '#ffd9dd',
    borderColor: '#b80045',
    borderWidth: 2,
  },
  categoryPillDark: {
    backgroundColor: '#2a2831',
    borderColor: '#3d3846',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5b4043',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  categoryPillTextActive: {
    color: '#b80045',
    fontWeight: '700',
  },
  categoryPillTextDark: {
    color: '#e8d0d3',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1ecf6',
    marginTop: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1b22',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#8f6f73',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#8f6f73',
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  pageSubtitleDark: {
    color: '#9a8a8d',
  },
});

