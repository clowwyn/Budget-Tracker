import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, ScrollView, TextInput, Alert, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
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
  Calendar,
  Store,
  Trash2,
} from 'lucide-react-native';

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

const STORAGE_KEY_ACCOUNTS = '@bloom_budget_accounts';
const STORAGE_KEY_TRANSACTIONS = '@bloom_budget_transactions';

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
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'wallets' | 'analytics' | 'settings'>('dashboard');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
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

  useEffect(() => {
    loadFonts();
    loadData();
  }, []);

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
      const hasSeenOnboarding = await AsyncStorage.getItem('@bloom_budget_onboarding_complete');
      
      if (accountsData) setAccounts(JSON.parse(accountsData));
      if (transactionsData) setTransactions(JSON.parse(transactionsData));
      
      // Show onboarding if first time
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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

    const balanceNum = parseFloat(newWalletBalance) || 0;

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

    const amount = parseFloat(newTransactionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 10);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@bloom_budget_onboarding_complete', 'true');
    setShowOnboarding(false);
    // Start interactive guide after onboarding
    setTimeout(() => setShowGuide(true), 500);
  };

  const handleResetTap = async () => {
    const newCount = resetTapCount + 1;
    setResetTapCount(newCount);
    
    if (newCount >= 5) {
      Alert.alert(
        'Reset App',
        'Clear all data and show onboarding again?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setResetTapCount(0) },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.clear();
              setAccounts([]);
              setTransactions([]);
              setShowOnboarding(true);
              setOnboardingStep(0);
              setResetTapCount(0);
            },
          },
        ]
      );
    }
    
    // Reset count after 2 seconds
    setTimeout(() => setResetTapCount(0), 2000);
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

    return (
      <Modal visible={showOnboarding} animationType="fade" transparent={false}>
        <View style={[styles.onboardingContainer, isDarkMode && styles.containerDark]}>
          <View style={styles.onboardingContent}>
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
          </View>

          <View style={styles.onboardingButtons}>
            {onboardingStep > 0 && (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.onboardingButtonSecondary}
                onPress={() => setOnboardingStep(onboardingStep - 1)}
              >
                <Text style={styles.onboardingButtonSecondaryText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              activeOpacity={1}
              style={styles.onboardingButtonPrimary}
              onPress={() => {
                if (isLastStep) {
                  completeOnboarding();
                } else {
                  setOnboardingStep(onboardingStep + 1);
                }
              }}
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
      target: 'fab',
      title: 'Add Your First Wallet',
      description: 'Tap this button to create a wallet or log transactions',
    },
    {
      target: 'header',
      title: 'Dark Mode',
      description: 'Toggle dark mode here for comfortable viewing',
    },
    {
      target: 'bottomNav',
      title: 'Navigate',
      description: 'Switch between Dashboard, Wallets, Analytics, and Settings',
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
          
          {/* Spotlight highlight - positioned based on target with just border, no fill */}
          {currentGuide.target === 'fab' && (
            <View style={styles.guideSpotlightFab}>
              <View style={styles.guideSpotlightCircle} />
            </View>
          )}
          {currentGuide.target === 'header' && (
            <View style={styles.guideSpotlightHeader}>
              <View style={styles.guideSpotlightCircle} />
            </View>
          )}
          {currentGuide.target === 'bottomNav' && (
            <View style={styles.guideSpotlightNav}>
              <View style={styles.guideSpotlightCircle} />
            </View>
          )}
          
          {/* Guide content card */}
          <View style={[
            styles.guideContent,
            currentGuide.target === 'fab' && { bottom: 200 },
            currentGuide.target === 'header' && { top: 140 },
            currentGuide.target === 'bottomNav' && { bottom: 120 },
          ]}>
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
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Total Balance Card */}
      <View style={[styles.balanceCard, isDarkMode && styles.balanceCardDark]}>
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
              <Text style={styles.summaryAmountPositive}>+₱{totalIncome.toFixed(2)}</Text>
            </View>
          </View>
          <View style={[styles.summaryPill, isDarkMode && styles.summaryPillDark]}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FFE5EC' }]}>
              <ArrowUp size={18} color="#b80045" />
            </View>
            <View>
              <Text style={[styles.summaryLabel, isDarkMode && styles.textDark]}>Expenses</Text>
              <Text style={styles.summaryAmountNegative}>-₱{totalExpenses.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* My Wallets Section */}
      <View style={styles.section}>
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
            <TouchableOpacity
              key={account.id}
              style={styles.walletCard}
              onPress={() => openEditWallet(account)}
              activeOpacity={1}
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
                  <Text style={styles.walletBalance}>{getCurrencySymbol(account.currency)}{account.balance.toFixed(2)}</Text>
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
              <Text style={styles.emptyText}>No wallets yet</Text>
              <Text style={styles.emptySubtext}>Tap to create one</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Recent Transactions</Text>
          <TouchableOpacity activeOpacity={1} onPress={() => setCurrentScreen('wallets')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 && (
          <View style={styles.emptyTransactions}>
            <Receipt size={32} color="#8f6f73" />
            <Text style={styles.emptyText}>No transactions yet</Text>
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
              <TouchableOpacity
                style={styles.transactionContent}
                onPress={() => {
                  // Could open edit modal in the future
                }}
              >
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
                    {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
                  </Text>
                  <Text style={[styles.transactionTime, isDarkMode && styles.textSecondaryDark]}>
                    {new Date(transaction.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.transactionDeleteButton}
                onPress={() => deleteTransaction(transaction.id)}
              >
                <Trash2 size={18} color="#ba1a1a" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderWallets = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Wallets</Text>
        <TouchableOpacity activeOpacity={1} onPress={() => setShowAddWallet(true)} style={styles.addButton}>
          <Plus size={14} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {accounts.length === 0 && (
        <View style={styles.emptyPage}>
          <Wallet size={64} color="#e3bdc1" />
          <Text style={styles.emptyPageTitle}>No wallets yet</Text>
          <Text style={styles.emptyPageText}>Create your first wallet to start tracking your finances</Text>
          <TouchableOpacity activeOpacity={1} style={styles.emptyPageButton} onPress={() => setShowAddWallet(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyPageButtonText}>Add Wallet</Text>
          </TouchableOpacity>
        </View>
      )}

      {accounts.map((account) => (
        <TouchableOpacity
          key={account.id}
          style={styles.walletListItem}
          onPress={() => openEditWallet(account)}
        >
          <View style={[styles.walletListIcon, { backgroundColor: account.color }]}>
            {account.type === 'bank' && <Building2 size={24} color="#fff" />}
            {account.type === 'debit' && <CreditCard size={24} color="#fff" />}
            {account.type === 'wallet' && <Wallet size={24} color="#fff" />}
            {account.type === 'cash' && <HandCoins size={24} color="#fff" />}
            {account.type === 'credit' && <CreditCard size={24} color="#fff" />}
          </View>
          <View style={styles.walletListInfo}>
            <Text style={styles.walletListName}>{account.name}</Text>
            <Text style={styles.walletListDetails}>{account.institution} • {account.type}</Text>
          </View>
          <Text style={styles.walletListBalance}>{getCurrencySymbol(account.currency)}{account.balance.toFixed(2)}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Analytics</Text>
      </View>

      <View style={styles.emptyPage}>
        <BarChart3 size={64} color="#e3bdc1" />
        <Text style={styles.emptyPageTitle}>Analytics Coming Soon</Text>
        <Text style={styles.emptyPageText}>View spending trends, budget insights, and financial reports</Text>
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>DATA</Text>
        <TouchableOpacity activeOpacity={1} style={styles.settingsItem}>
          <Text style={styles.settingsItemText}>Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} 
          style={styles.settingsItem}
          onPress={async () => {
            Alert.alert(
              'Clear All Data',
              'This will delete all wallets and transactions. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.clear();
                    setAccounts([]);
                    setTransactions([]);
                    Alert.alert('Success', 'All data cleared');
                  },
                },
              ]
            );
          }}
        >
          <Text style={[styles.settingsItemText, { color: '#ba1a1a' }]}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>ABOUT</Text>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsItemText}>Version 1.0.0</Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} hidden={false} />
      
      {/* Onboarding */}
      {showOnboarding && renderOnboarding()}
      
      {/* Interactive Guide */}
      {showGuide && renderGuide()}
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, isDarkMode && styles.avatarDark]}>
            <User size={20} color={isDarkMode ? "#e3bdc1" : "#5b4043"} />
          </View>
          <View>
            <Text style={[styles.welcomeText, isDarkMode && styles.textDark]}>Welcome back</Text>
            <TouchableOpacity activeOpacity={1} onPress={handleResetTap}>
              <Text style={[styles.nameText, isDarkMode && styles.textDark]}>Hey, You ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity activeOpacity={1} style={[styles.iconButton, isDarkMode && styles.iconButtonDark]} onPress={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={18} color="#e3bdc1" /> : <Sun size={18} color="#5b4043" />}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} style={[styles.iconButton, isDarkMode && styles.iconButtonDark]}>
            <Bell size={18} color="#b80045" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Screen */}
      {currentScreen === 'dashboard' && renderDashboard()}
      {currentScreen === 'wallets' && renderWallets()}
      {currentScreen === 'analytics' && renderAnalytics()}
      {currentScreen === 'settings' && renderSettings()}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowActionMenu(true)}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity activeOpacity={1} 
          style={[styles.navItem, currentScreen === 'dashboard' && styles.navItemActive]}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <LayoutDashboard size={22} color={currentScreen === 'dashboard' ? '#b80045' : '#5b4043'} />
          <Text style={[styles.navLabel, currentScreen === 'dashboard' && styles.navLabelActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} 
          style={[styles.navItem, currentScreen === 'wallets' && styles.navItemActive]}
          onPress={() => setCurrentScreen('wallets')}
        >
          <Wallet size={22} color={currentScreen === 'wallets' ? '#b80045' : '#5b4043'} />
          <Text style={[styles.navLabel, currentScreen === 'wallets' && styles.navLabelActive]}>Wallets</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} 
          style={[styles.navItem, currentScreen === 'analytics' && styles.navItemActive]}
          onPress={() => setCurrentScreen('analytics')}
        >
          <BarChart3 size={22} color={currentScreen === 'analytics' ? '#b80045' : '#5b4043'} />
          <Text style={[styles.navLabel, currentScreen === 'analytics' && styles.navLabelActive]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} 
          style={[styles.navItem, currentScreen === 'settings' && styles.navItemActive]}
          onPress={() => setCurrentScreen('settings')}
        >
          <Settings size={22} color={currentScreen === 'settings' ? '#b80045' : '#5b4043'} />
          <Text style={[styles.navLabel, currentScreen === 'settings' && styles.navLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Wallet Modal */}
      <Modal visible={showAddWallet} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity activeOpacity={1} onPress={closeWalletModal}>
                <X size={24} color="#1c1b22" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editingAccount ? 'Edit Wallet' : 'Add New Wallet'}</Text>
              <TouchableOpacity activeOpacity={1} onPress={addOrUpdateWallet}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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

              <Text style={styles.stepTitle}>Step 1: Select Institution / Type</Text>
              <View style={styles.institutionButtons}>
                {['BDO', 'BPI', 'Metrobank', 'UnionBank', 'GCash', 'PayMaya', 'Other'].map((inst) => (
                  <TouchableOpacity
                    key={inst}
                    style={[styles.institutionButton, newWalletInstitution === inst && styles.institutionButtonActive]}
                    onPress={() => setNewWalletInstitution(inst)}
                  >
                    <Building2 size={18} color={newWalletInstitution === inst ? '#fff' : '#1c1b22'} />
                    <Text style={[styles.institutionButtonText, newWalletInstitution === inst && { color: '#fff' }]}>
                      {inst}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.stepTitle}>Step 2: Account Details & Classification</Text>
              
              <Text style={styles.inputLabel}>Wallet Nickname</Text>
              <TextInput
                style={styles.input}
                value={newWalletName}
                onChangeText={setNewWalletName}
                placeholder="e.g., Everyday Spending"
                placeholderTextColor="#8f6f73"
              />

              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.typeButtons}>
                {[
                  { value: 'bank' as const, label: 'Checking' },
                  { value: 'debit' as const, label: 'Debit Card' },
                  { value: 'credit' as const, label: 'Credit Card' },
                  { value: 'wallet' as const, label: 'Digital Wallet' },
                  { value: 'cash' as const, label: 'Cash' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.typeButton, newWalletType === type.value && styles.typeButtonActive]}
                    onPress={() => setNewWalletType(type.value)}
                  >
                    <Text style={[styles.typeButtonText, newWalletType === type.value && { color: '#fff' }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Initial Balance</Text>
                  <TextInput
                    style={styles.input}
                    value={newWalletBalance}
                    onChangeText={setNewWalletBalance}
                    placeholder="1,500.00"
                    keyboardType="numeric"
                    placeholderTextColor="#8f6f73"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Currency</Text>
                  <View style={styles.currencySelector}>
                    {['PHP', 'USD', 'JPY'].map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        style={[
                          styles.currencyOption,
                          newWalletCurrency === curr && styles.currencyOptionActive
                        ]}
                        onPress={() => setNewWalletCurrency(curr)}
                      >
                        <Text style={[
                          styles.currencyOptionText,
                          newWalletCurrency === curr && styles.currencyOptionTextActive
                        ]}>
                          {curr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.stepTitle}>Step 3: Card Styling & Palette</Text>
              <Text style={styles.paletteSubtitle}>Premium Gradient Collections</Text>
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
                  <TouchableOpacity
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
                <TouchableOpacity
                  style={styles.deleteWalletButton}
                  onPress={() => {
                    closeWalletModal();
                    deleteWallet(editingAccount.id);
                  }}
                >
                  <Trash2 size={18} color="#ba1a1a" />
                  <Text style={styles.deleteWalletText}>Delete Wallet</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={showAddTransaction} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity activeOpacity={1} onPress={() => {
                setShowAddTransaction(false);
                setNewTransactionAmount('');
                setNewTransactionMerchant('');
                setNewTransactionAccount(null);
              }}>
                <X size={24} color="#1c1b22" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Log Transaction</Text>
              <TouchableOpacity activeOpacity={1} onPress={addTransaction}>
                <Text style={styles.modalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Type Pills */}
              <View style={styles.transactionTypePills}>
                {(['expense', 'income', 'transfer'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.transactionTypePill, newTransactionType === type && styles.transactionTypePillActive]}
                    onPress={() => setNewTransactionType(type)}
                  >
                    <Text style={[styles.transactionTypePillText, newTransactionType === type && { color: '#fff' }]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount Input */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>LOGGING {newTransactionType.toUpperCase()}</Text>
                <TextInput
                  style={styles.amountInput}
                  value={newTransactionAmount}
                  onChangeText={setNewTransactionAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#e3bdc1"
                />
                <Text style={styles.amountHint}>Tap to edit amount</Text>
              </View>

              {/* Account Selection */}
              <Text style={styles.inputLabel}>
                {newTransactionType === 'transfer' ? 'FROM ACCOUNT' : 'DEBIT SOURCE'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelection}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountChip,
                      newTransactionAccount === account.id && styles.accountChipActive
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
                    <Text style={styles.accountChipName}>{account.name}</Text>
                    <Text style={styles.accountChipLast}>•••• {account.lastFour}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Transfer To Account (only show for transfers) */}
              {newTransactionType === 'transfer' && (
                <>
                  <View style={styles.transferArrow}>
                    <ArrowDown size={24} color="#b80045" />
                  </View>
                  <Text style={styles.inputLabel}>TO ACCOUNT</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountSelection}>
                    {accounts
                      .filter(acc => acc.id !== newTransactionAccount)
                      .map((account) => (
                        <TouchableOpacity
                          key={account.id}
                          style={[
                            styles.accountChip,
                            newTransactionToAccount === account.id && styles.accountChipActive
                          ]}
                          onPress={() => setNewTransactionToAccount(account.id)}
                        >
                          <View style={[styles.accountChipIcon, { backgroundColor: account.color }]}>
                            {account.type === 'bank' && <Building2 size={16} color="#fff" />}
                            {account.type === 'wallet' && <Smartphone size={16} color="#fff" />}
                            {account.type === 'cash' && <HandCoins size={16} color="#fff" />}
                            {account.type === 'credit' && <CreditCard size={16} color="#fff" />}
                          </View>
                          <Text style={styles.accountChipName}>{account.name}</Text>
                          <Text style={styles.accountChipLast}>•••• {account.lastFour}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </>
              )}

              {/* Category Selection */}
              <Text style={styles.inputLabel}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {Object.entries(categoryIcons).map(([cat, Icon]) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBox,
                      newTransactionCategory === cat && styles.categoryBoxActive
                    ]}
                    onPress={() => setNewTransactionCategory(cat)}
                  >
                    <View style={[
                      styles.categoryIcon,
                      newTransactionCategory === cat && { backgroundColor: '#b80045' }
                    ]}>
                      <Icon size={20} color={newTransactionCategory === cat ? '#fff' : '#b80045'} />
                    </View>
                    <Text style={styles.categoryLabel}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date & Time */}
              <View style={styles.dateTimeSection}>
                <Calendar size={20} color="#b80045" />
                <View style={styles.dateTimeInfo}>
                  <Text style={styles.dateTimeLabel}>DATE & TIME</Text>
                  <Text style={styles.dateTimeValue}>
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
                <Store size={20} color="#5b4043" />
                <View style={styles.merchantInfo}>
                  <Text style={styles.merchantLabel}>MERCHANT / NOTE</Text>
                  <TextInput
                    style={styles.merchantInput}
                    value={newTransactionMerchant}
                    onChangeText={setNewTransactionMerchant}
                    placeholder="e.g., Whole Foods Market"
                    placeholderTextColor="#8f6f73"
                  />
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            <TouchableOpacity activeOpacity={1} style={styles.saveTransactionButton} onPress={addTransaction}>
              <Text style={styles.saveTransactionText}>💾 Save Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action Menu Modal */}
      <Modal visible={showActionMenu} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.actionMenuOverlay}
          activeOpacity={1}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={styles.actionMenuContent}>
            <Text style={styles.actionMenuTitle}>What do you want to do?</Text>
            
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                setShowAddWallet(true);
              }}
            >
              <View style={styles.actionMenuIconContainer}>
                <Wallet size={24} color="#b80045" />
              </View>
              <View style={styles.actionMenuTextContainer}>
                <Text style={styles.actionMenuItemTitle}>Add Wallet</Text>
                <Text style={styles.actionMenuItemSubtitle}>Create a new bank account or wallet</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                setShowAddTransaction(true);
              }}
            >
              <View style={styles.actionMenuIconContainer}>
                <Receipt size={24} color="#b80045" />
              </View>
              <View style={styles.actionMenuTextContainer}>
                <Text style={styles.actionMenuItemTitle}>Log Transaction</Text>
                <Text style={styles.actionMenuItemSubtitle}>Record an expense, income, or transfer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionMenuItem, styles.actionMenuItemLast]}
              onPress={() => setShowActionMenu(false)}
            >
              <View style={styles.actionMenuIconContainer}>
                <X size={24} color="#5b4043" />
              </View>
              <View style={styles.actionMenuTextContainer}>
                <Text style={styles.actionMenuItemTitle}>Cancel</Text>
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
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
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
    gap: 4,
    backgroundColor: '#b80045',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
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
    paddingRight: 4,
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
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  transactionAmountPositive: {
    color: '#006947',
  },
  transactionAmountNegative: {
    color: '#1c1b22',
  },
  transactionTime: {
    fontSize: 11,
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
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8f6f73',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
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
  currencyOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  currencyOptionActive: {
    backgroundColor: 'transparent',
  },
  currencyOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  currencyOptionTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b80045',
    fontFamily: 'PlusJakartaSans-SemiBold',
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
    position: 'relative',
  },
  guideDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
  },
  guideSpotlightFab: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  guideSpotlightHeader: {
    position: 'absolute',
    top: 12,
    right: 18,
    width: 84,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  guideSpotlightNav: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    height: 78,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  guideSpotlightCircle: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#ff1464',
    shadowColor: '#ff1464',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 20,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1b22',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  guideDescription: {
    fontSize: 15,
    color: '#5b4043',
    lineHeight: 22,
    marginBottom: 16,
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
});
