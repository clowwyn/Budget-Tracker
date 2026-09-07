export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId: string | null;
  description: string;
  date: Date;
  // For transfers
  toAccountId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId?: string | null;
  description: string;
  date: Date;
  toAccountId?: string | null;
}

export interface UpdateTransactionInput {
  amount?: number;
  categoryId?: string | null;
  description?: string;
  date?: Date;
}
