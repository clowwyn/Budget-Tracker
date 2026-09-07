import { Database } from 'sql.js';
import { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../../domain/models';
import { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import { DatabaseService } from './DatabaseService';

export class SQLiteTransactionRepository implements TransactionRepository {
  private db: Database;

  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const dateStr = input.date.toISOString();

    this.db.run(
      `INSERT INTO transactions (id, account_id, type, amount, currency, category_id, description, date, to_account_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.accountId,
        input.type,
        input.amount,
        input.currency,
        input.categoryId || null,
        input.description,
        dateStr,
        input.toAccountId || null,
        now,
        now,
      ]
    );

    DatabaseService.getInstance().saveDatabase();

    return {
      id,
      accountId: input.accountId,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      categoryId: input.categoryId || null,
      description: input.description,
      date: input.date,
      toAccountId: input.toAccountId,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async findById(id: string): Promise<Transaction | null> {
    const result = this.db.exec('SELECT * FROM transactions WHERE id = ?', [id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.mapToTransaction(result[0]);
  }

  async findAll(): Promise<Transaction[]> {
    const result = this.db.exec('SELECT * FROM transactions ORDER BY date DESC');

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((_, index) => this.mapToTransaction(result[0], index));
  }

  async findByAccount(accountId: string): Promise<Transaction[]> {
    const result = this.db.exec(
      'SELECT * FROM transactions WHERE account_id = ? OR to_account_id = ? ORDER BY date DESC',
      [accountId, accountId]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((_, index) => this.mapToTransaction(result[0], index));
  }

  async findByCategory(categoryId: string): Promise<Transaction[]> {
    const result = this.db.exec(
      'SELECT * FROM transactions WHERE category_id = ? ORDER BY date DESC',
      [categoryId]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((_, index) => this.mapToTransaction(result[0], index));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const result = this.db.exec(
      'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate.toISOString(), endDate.toISOString()]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((_, index) => this.mapToTransaction(result[0], index));
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (input.amount !== undefined) {
      updates.push('amount = ?');
      values.push(input.amount);
    }
    if (input.categoryId !== undefined) {
      updates.push('category_id = ?');
      values.push(input.categoryId);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.date !== undefined) {
      updates.push('date = ?');
      values.push(input.date.toISOString());
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.run(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`, values);

    DatabaseService.getInstance().saveDatabase();

    return this.findById(id) as Promise<Transaction>;
  }

  async delete(id: string): Promise<void> {
    this.db.run('DELETE FROM transactions WHERE id = ?', [id]);
    DatabaseService.getInstance().saveDatabase();
  }

  private mapToTransaction(result: any, index: number = 0): Transaction {
    const columns = result.columns;
    const values = result.values[index];

    const getCol = (name: string) => {
      const idx = columns.indexOf(name);
      return values[idx];
    };

    return {
      id: getCol('id') as string,
      accountId: getCol('account_id') as string,
      type: getCol('type') as Transaction['type'],
      amount: getCol('amount') as number,
      currency: getCol('currency') as string,
      categoryId: getCol('category_id') as string | null,
      description: getCol('description') as string,
      date: new Date(getCol('date') as string),
      toAccountId: getCol('to_account_id') as string | null | undefined,
      createdAt: new Date(getCol('created_at') as string),
      updatedAt: new Date(getCol('updated_at') as string),
    };
  }
}
