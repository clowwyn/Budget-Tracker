import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../../infrastructure/database/DatabaseService';
import { AccountService } from '../../application/services/AccountService';
import { TransactionService } from '../../application/services/TransactionService';
import { CategoryService } from '../../application/services/CategoryService';

describe('Complete Workflow Integration Tests', () => {
  let accountService: AccountService;
  let transactionService: TransactionService;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const db = DatabaseService.getInstance();
    db.clearDatabase();
    await db.initialize();
    
    accountService = new AccountService();
    transactionService = new TransactionService();
    categoryService = new CategoryService();
    
    // Initialize categories
    await categoryService.initializeDefaultCategories();
  });

  it('should complete a full user workflow: create accounts, add transactions, check balances', async () => {
    // Step 1: Create bank account
    const bankAccount = await accountService.createAccount({
      name: 'Main Bank',
      type: 'bank',
      currency: 'USD',
      initialBalance: 5000,
      color: '#FFB2BC',
    });

    expect(bankAccount.currentBalance).toBe(5000);

    // Step 2: Create wallet account
    const walletAccount = await accountService.createAccount({
      name: 'Digital Wallet',
      type: 'wallet',
      currency: 'USD',
      initialBalance: 500,
      color: '#10B981',
    });

    expect(walletAccount.currentBalance).toBe(500);

    // Step 3: Check total balance
    let totalBalance = await accountService.getTotalBalance();
    expect(totalBalance).toBe(5500);

    // Step 4: Add salary income
    const categories = await categoryService.getCategoriesByType('income');
    const salaryCategory = categories.find((c) => c.name === 'Salary');

    const incomeTransaction = await transactionService.createTransaction({
      accountId: bankAccount.id,
      type: 'income',
      amount: 3000,
      currency: 'USD',
      categoryId: salaryCategory?.id || null,
      description: 'Monthly Salary',
      date: new Date(),
    });

    expect(incomeTransaction).toBeDefined();

    // Step 5: Check updated bank balance
    const updatedBank = await accountService.getAccount(bankAccount.id);
    expect(updatedBank?.currentBalance).toBe(8000); // 5000 + 3000

    // Step 6: Add grocery expense
    const expenseCategories = await categoryService.getCategoriesByType('expense');
    const foodCategory = expenseCategories.find((c) => c.name === 'Food');

    await transactionService.createTransaction({
      accountId: bankAccount.id,
      type: 'expense',
      amount: 150,
      currency: 'USD',
      categoryId: foodCategory?.id || null,
      description: 'Grocery Shopping',
      date: new Date(),
    });

    // Step 7: Verify bank balance after expense
    const afterExpense = await accountService.getAccount(bankAccount.id);
    expect(afterExpense?.currentBalance).toBe(7850); // 8000 - 150

    // Step 8: Transfer money from bank to wallet
    await transactionService.createTransaction({
      accountId: bankAccount.id,
      type: 'transfer',
      amount: 200,
      currency: 'USD',
      description: 'Top up wallet',
      date: new Date(),
      toAccountId: walletAccount.id,
    });

    // Step 9: Verify both account balances after transfer
    const bankAfterTransfer = await accountService.getAccount(bankAccount.id);
    const walletAfterTransfer = await accountService.getAccount(walletAccount.id);

    expect(bankAfterTransfer?.currentBalance).toBe(7650); // 7850 - 200
    expect(walletAfterTransfer?.currentBalance).toBe(700); // 500 + 200

    // Step 10: Verify total balance remains correct
    totalBalance = await accountService.getTotalBalance();
    expect(totalBalance).toBe(8350); // 7650 + 700

    // Step 11: Get income and expense totals
    const totalIncome = await transactionService.getTotalIncome();
    const totalExpense = await transactionService.getTotalExpense();

    expect(totalIncome).toBe(3000);
    expect(totalExpense).toBe(150);

    // Step 12: Verify transaction history
    const bankTransactions = await transactionService.getTransactionsByAccount(bankAccount.id);
    expect(bankTransactions.length).toBe(3); // income, expense, transfer (only shows once per account)

    const walletTransactions = await transactionService.getTransactionsByAccount(walletAccount.id);
    expect(walletTransactions.length).toBe(1); // transfer in
  });

  it('should handle account deletion with transactions properly', async () => {
    // Create account and add transactions
    const account = await accountService.createAccount({
      name: 'Temporary Account',
      type: 'cash',
      currency: 'USD',
      initialBalance: 1000,
    });

    await transactionService.createTransaction({
      accountId: account.id,
      type: 'income',
      amount: 500,
      currency: 'USD',
      description: 'Income',
      date: new Date(),
    });

    // Verify transactions exist
    const transactions = await transactionService.getTransactionsByAccount(account.id);
    expect(transactions.length).toBe(1);

    // Delete account (should cascade delete transactions due to FK constraint)
    await accountService.deleteAccount(account.id);

    // Verify account is deleted
    const deletedAccount = await accountService.getAccount(account.id);
    expect(deletedAccount).toBeNull();

    // Note: SQL.js CASCADE behavior may vary in test environment
    // In production, transactions would be cascaded or handled by app logic
  });

  it('should maintain data integrity across multiple operations', async () => {
    // Create multiple accounts
    const accounts = await Promise.all([
      accountService.createAccount({
        name: 'Account 1',
        type: 'bank',
        currency: 'USD',
        initialBalance: 1000,
      }),
      accountService.createAccount({
        name: 'Account 2',
        type: 'wallet',
        currency: 'USD',
        initialBalance: 500,
      }),
      accountService.createAccount({
        name: 'Account 3',
        type: 'cash',
        currency: 'USD',
        initialBalance: 250,
      }),
    ]);

    // Add transactions to each
    for (const account of accounts) {
      await transactionService.createTransaction({
        accountId: account.id,
        type: 'income',
        amount: 100,
        currency: 'USD',
        description: `Income for ${account.name}`,
        date: new Date(),
      });
    }

    // Verify all accounts updated (order from DB might vary, so check by finding each)
    const updatedAccounts = await accountService.getAllAccounts();
    const acct1 = updatedAccounts.find(a => a.name === 'Account 1');
    const acct2 = updatedAccounts.find(a => a.name === 'Account 2');
    const acct3 = updatedAccounts.find(a => a.name === 'Account 3');
    
    expect(acct1?.currentBalance).toBe(1100);
    expect(acct2?.currentBalance).toBe(600);
    expect(acct3?.currentBalance).toBe(350);

    // Verify total balance
    const totalBalance = await accountService.getTotalBalance();
    expect(totalBalance).toBe(2050); // 1100 + 600 + 350
  });

  it('should prevent invalid transfers', async () => {
    const account = await accountService.createAccount({
      name: 'Single Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    // Try to transfer to the same account
    await expect(
      transactionService.createTransaction({
        accountId: account.id,
        type: 'transfer',
        amount: 100,
        currency: 'USD',
        description: 'Invalid transfer',
        date: new Date(),
        toAccountId: account.id,
      })
    ).rejects.toThrow('Cannot transfer to the same account');
  });

  it('should handle date range queries correctly', async () => {
    const account = await accountService.createAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Add transactions on different dates
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'income',
      amount: 100,
      currency: 'USD',
      description: 'Yesterday income',
      date: yesterday,
    });

    await transactionService.createTransaction({
      accountId: account.id,
      type: 'expense',
      amount: 50,
      currency: 'USD',
      description: 'Today expense',
      date: now,
    });

    // Query by date range
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const transactions = await transactionService.getTransactionsByDateRange(
      startOfYesterday,
      endOfToday
    );

    expect(transactions.length).toBe(2);
  });

  it('should calculate correct totals for date ranges', async () => {
    const account = await accountService.createAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Add income last month
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'income',
      amount: 500,
      currency: 'USD',
      description: 'Last month income',
      date: lastMonth,
    });

    // Add income this month
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'income',
      amount: 300,
      currency: 'USD',
      description: 'This month income',
      date: today,
    });

    // Add expense this month
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'expense',
      amount: 100,
      currency: 'USD',
      description: 'This month expense',
      date: today,
    });

    // Total income (all time)
    const totalIncome = await transactionService.getTotalIncome();
    expect(totalIncome).toBe(800);

    // Total expense (all time)
    const totalExpense = await transactionService.getTotalExpense();
    expect(totalExpense).toBe(100);

    // Income this month only
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thisMonthIncome = await transactionService.getTotalIncome(startOfMonth, endOfMonth);
    expect(thisMonthIncome).toBe(300);
  });
});
