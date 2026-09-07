import { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../models';

export interface TransactionRepository {
  create(input: CreateTransactionInput): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findAll(): Promise<Transaction[]>;
  findByAccount(accountId: string): Promise<Transaction[]>;
  findByCategory(categoryId: string): Promise<Transaction[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  update(id: string, input: UpdateTransactionInput): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
