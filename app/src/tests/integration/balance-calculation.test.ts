import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../../infrastructure/database/DatabaseService';
import { AccountService } from '../../application/services/AccountService';
import { TransactionService } from '../../application/services/TransactionService';

describe('Balance Calculation Integration Tests', () => {
  let accountService: AccountService;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const db = DatabaseService.getInstance();
    db.clearDatabase();
    await db.initialize();
    
    accountService = new AccountService();
    transactionService = new TransactionService();
  });

  it('should correctly calculate balance after income', async () => {
    const account = await accountService.createAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    await transactionService.createTransaction({
      accountId: account.id,
      type: 'income',
      amount: 500,
      currency: 'USD',
      description: 'Salary',
      date: new Date(),
    });

    const updated = await accountService.getAccount(account.id);
    expect(updated?.currentBalance).toBe(1500);
  });

  it('should correctly calculate balance after expense', async () => {
    const account = await accountService.createAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    await transactionService.createTransaction({
      accountId: account.id,
      type: 'expense',
      amount: 300,
      currency: 'USD',
      description: 'Shopping',
      date: new Date(),
    });

    const updated = await accountService.getAccount(account.id);
    expect(updated?.currentBalance).toBe(700);
  });

  it('should correctly calculate balance after multiple transactions', async () => {
    const account = await accountService.createAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    // Income: +500
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'income',
      amount: 500,
      currency: 'USD',
      description: 'Income 1',
      date: new Date(),
    });

    // Expense: -200
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'expense',
      amount: 200,
      currency: 'USD',
      description: 'Expense 1',
      date: new Date(),
    });

    // Income: +300
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'income',
      amount: 300,
      currency: 'USD',
      description: 'Income 2',
      date: new Date(),
    });

    // Expense: -100
    await transactionService.createTransaction({
      accountId: account.id,
      type: 'expense',
      amount: 100,
      currency: 'USD',
      description: 'Expense 2',
      date: new Date(),
    });

    // Expected: 1000 + 500 - 200 + 300 - 100 = 1500
    const updated = await accountService.getAccount(account.id);
    expect(updated?.currentBalance).toBe(1500);
  });

  it('should correctly handle transfers', async () => {
    const account1 = await accountService.createAccount({
      name: 'Account 1',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    const account2 = await accountService.createAccount({
      name: 'Account 2',
      type: 'wallet',
      currency: 'USD',
      initialBalance: 500,
    });

    // Transfer 200 from account1 to account2
    await transactionService.createTransaction({
      accountId: account1.id,
      type: 'transfer',
      amount: 200,
      currency: 'USD',
      description: 'Transfer',
      date: new Date(),
      toAccountId: account2.id,
    });

    const updated1 = await accountService.getAccount(account1.id);
    const updated2 = await accountService.getAccount(account2.id);

    expect(updated1?.currentBalance).toBe(800); // 1000 - 200
    expect(updated2?.currentBalance).toBe(700); // 500 + 200
  });

  it('should recalculate balance when transaction is updated', async () => {
    const account = await accountService.createAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    const transaction = await transactionService.createTransaction({
      accountId: account.id,
      type: 'expense',
      amount: 100,
      currency: 'USD',
      description: 'Original',
      date: new Date(),
    });

    // Balance should be 900
    let updated = await accountService.getAccount(account.id);
    expect(updated?.currentBalance).toBe(900);

    // Update transaction amount to 300
    await transactionService.updateTransaction(transaction.id, {
      amount: 300,
    });

    // Balance should now be 700
    updated = await accountService.getAccount(account.id);
    expect(updated?.currentBalance).toBe(700);
  });

  it('should recalculate balance when transaction is deleted', async () => {
    const account = await accountService.createAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    const transaction = await transactionService.createTransaction({
      accountId: account.id,
      type: 'expense',
      amount: 250,
      currency: 'USD',
      description: 'To be deleted',
      date: new Date(),
    });

    // Balance should be 750
    let updated = await accountService.getAccount(account.id);
    expect(updated?.currentBalance).toBe(750);

    // Delete transaction
    await transactionService.deleteTransaction(transaction.id);

    // Balance should return to 1000
    updated = await accountService.getAccount(account.id);
    expect(updated?.currentBalance).toBe(1000);
  });

  it('should calculate total balance across all accounts', async () => {
    await accountService.createAccount({
      name: 'Account 1',
      type: 'bank',
      currency: 'USD',
      initialBalance: 1000,
    });

    await accountService.createAccount({
      name: 'Account 2',
      type: 'wallet',
      currency: 'USD',
      initialBalance: 500,
    });

    await accountService.createAccount({
      name: 'Account 3',
      type: 'cash',
      currency: 'USD',
      initialBalance: 250,
    });

    const totalBalance = await accountService.getTotalBalance();
    expect(totalBalance).toBe(1750);
  });
});
