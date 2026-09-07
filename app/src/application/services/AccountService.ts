import { Account, CreateAccountInput, UpdateAccountInput } from '../../domain/models';
import { AccountRepository } from '../../domain/repositories/AccountRepository';
import { SQLiteAccountRepository } from '../../infrastructure/database/SQLiteAccountRepository';
import { SQLiteTransactionRepository } from '../../infrastructure/database/SQLiteTransactionRepository';

export class AccountService {
  private accountRepo: AccountRepository;
  private transactionRepo: SQLiteTransactionRepository;

  constructor() {
    this.accountRepo = new SQLiteAccountRepository();
    this.transactionRepo = new SQLiteTransactionRepository();
  }

  async createAccount(input: CreateAccountInput): Promise<Account> {
    // Validation
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Account name is required');
    }
    if (input.name.trim().length > 50) {
      throw new Error('Account name must be 50 characters or less');
    }
    if (!['bank', 'wallet', 'cash', 'card'].includes(input.type)) {
      throw new Error('Invalid account type');
    }
    if (!input.currency || input.currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code (e.g., USD, EUR)');
    }
    if (typeof input.initialBalance !== 'number') {
      throw new Error('Initial balance must be a number');
    }

    return this.accountRepo.create(input);
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountRepo.findAll();
  }

  async getAccount(id: string): Promise<Account | null> {
    return this.accountRepo.findById(id);
  }

  async updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
    return this.accountRepo.update(id, input);
  }

  async deleteAccount(id: string): Promise<void> {
    await this.accountRepo.delete(id);
  }

  async recalculateBalance(accountId: string): Promise<void> {
    const account = await this.accountRepo.findById(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const transactions = await this.transactionRepo.findByAccount(accountId);
    
    let balance = account.initialBalance;

    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        balance += transaction.amount;
      } else if (transaction.type === 'expense') {
        balance -= transaction.amount;
      } else if (transaction.type === 'transfer') {
        if (transaction.accountId === accountId) {
          // Money leaving this account
          balance -= transaction.amount;
        }
        if (transaction.toAccountId === accountId) {
          // Money coming into this account
          balance += transaction.amount;
        }
      }
    }

    await this.accountRepo.updateBalance(accountId, balance);
  }

  async getTotalBalance(): Promise<number> {
    const accounts = await this.accountRepo.findAll();
    return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  }
}
