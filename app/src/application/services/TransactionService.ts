import { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../../domain/models';
import { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import { SQLiteTransactionRepository } from '../../infrastructure/database/SQLiteTransactionRepository';
import { AccountService } from './AccountService';

export class TransactionService {
  private transactionRepo: TransactionRepository;
  private accountService: AccountService;

  constructor() {
    this.transactionRepo = new SQLiteTransactionRepository();
    this.accountService = new AccountService();
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    // Validation
    if (input.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }
    if (!input.description || input.description.trim().length === 0) {
      throw new Error('Transaction description is required');
    }
    if (input.description.trim().length > 200) {
      throw new Error('Description must be 200 characters or less');
    }
    if (!['income', 'expense', 'transfer'].includes(input.type)) {
      throw new Error('Invalid transaction type');
    }

    // Validate account exists
    const account = await this.accountService.getAccount(input.accountId);
    if (!account) {
      throw new Error(`Account ${input.accountId} not found`);
    }

    // For transfers, validate destination account
    if (input.type === 'transfer') {
      if (!input.toAccountId) {
        throw new Error('Destination account is required for transfers');
      }
      const toAccount = await this.accountService.getAccount(input.toAccountId);
      if (!toAccount) {
        throw new Error(`Destination account ${input.toAccountId} not found`);
      }
      if (input.toAccountId === input.accountId) {
        throw new Error('Cannot transfer to the same account');
      }
    }

    const transaction = await this.transactionRepo.create(input);

    // Recalculate balances
    await this.accountService.recalculateBalance(input.accountId);
    if (input.toAccountId) {
      await this.accountService.recalculateBalance(input.toAccountId);
    }

    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepo.findAll();
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.transactionRepo.findById(id);
  }

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    return this.transactionRepo.findByAccount(accountId);
  }

  async getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
    return this.transactionRepo.findByCategory(categoryId);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionRepo.findByDateRange(startDate, endDate);
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const existing = await this.transactionRepo.findById(id);
    if (!existing) {
      throw new Error(`Transaction ${id} not found`);
    }

    const transaction = await this.transactionRepo.update(id, input);

    // Recalculate balances
    await this.accountService.recalculateBalance(existing.accountId);
    if (existing.toAccountId) {
      await this.accountService.recalculateBalance(existing.toAccountId);
    }

    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const existing = await this.transactionRepo.findById(id);
    if (!existing) {
      throw new Error(`Transaction ${id} not found`);
    }

    await this.transactionRepo.delete(id);

    // Recalculate balances
    await this.accountService.recalculateBalance(existing.accountId);
    if (existing.toAccountId) {
      await this.accountService.recalculateBalance(existing.toAccountId);
    }
  }

  async getTotalIncome(startDate?: Date, endDate?: Date): Promise<number> {
    const transactions = startDate && endDate
      ? await this.transactionRepo.findByDateRange(startDate, endDate)
      : await this.transactionRepo.findAll();

    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  async getTotalExpense(startDate?: Date, endDate?: Date): Promise<number> {
    const transactions = startDate && endDate
      ? await this.transactionRepo.findByDateRange(startDate, endDate)
      : await this.transactionRepo.findAll();

    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
