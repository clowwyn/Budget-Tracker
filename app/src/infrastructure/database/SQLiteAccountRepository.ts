import { Database } from 'sql.js';
import { Account, CreateAccountInput, UpdateAccountInput } from '../../domain/models';
import { AccountRepository } from '../../domain/repositories/AccountRepository';
import { DatabaseService } from './DatabaseService';

export class SQLiteAccountRepository implements AccountRepository {
  private db: Database;

  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }

  async create(input: CreateAccountInput): Promise<Account> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO accounts (id, name, type, currency, initial_balance, current_balance, color, icon, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name,
        input.type,
        input.currency,
        input.initialBalance,
        input.initialBalance, // current_balance starts as initial_balance
        input.color || null,
        input.icon || null,
        now,
        now,
      ]
    );

    DatabaseService.getInstance().saveDatabase();

    return {
      id,
      name: input.name,
      type: input.type,
      currency: input.currency,
      initialBalance: input.initialBalance,
      currentBalance: input.initialBalance,
      color: input.color,
      icon: input.icon,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async findById(id: string): Promise<Account | null> {
    const result = this.db.exec('SELECT * FROM accounts WHERE id = ?', [id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.mapToAccount(result[0]);
  }

  async findAll(): Promise<Account[]> {
    const result = this.db.exec('SELECT * FROM accounts ORDER BY created_at DESC');

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((_, index) => this.mapToAccount(result[0], index));
  }

  async update(id: string, input: UpdateAccountInput): Promise<Account> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Account with id ${id} not found`);
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.type !== undefined) {
      updates.push('type = ?');
      values.push(input.type);
    }
    if (input.currency !== undefined) {
      updates.push('currency = ?');
      values.push(input.currency);
    }
    if (input.color !== undefined) {
      updates.push('color = ?');
      values.push(input.color);
    }
    if (input.icon !== undefined) {
      updates.push('icon = ?');
      values.push(input.icon);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.run(`UPDATE accounts SET ${updates.join(', ')} WHERE id = ?`, values);

    DatabaseService.getInstance().saveDatabase();

    return this.findById(id) as Promise<Account>;
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    const now = new Date().toISOString();
    
    this.db.run(
      'UPDATE accounts SET current_balance = ?, updated_at = ? WHERE id = ?',
      [newBalance, now, id]
    );

    DatabaseService.getInstance().saveDatabase();
  }

  async delete(id: string): Promise<void> {
    this.db.run('DELETE FROM accounts WHERE id = ?', [id]);
    DatabaseService.getInstance().saveDatabase();
  }

  private mapToAccount(result: any, index: number = 0): Account {
    const columns = result.columns;
    const values = result.values[index];

    const getCol = (name: string) => {
      const idx = columns.indexOf(name);
      return values[idx];
    };

    return {
      id: getCol('id') as string,
      name: getCol('name') as string,
      type: getCol('type') as Account['type'],
      currency: getCol('currency') as string,
      initialBalance: getCol('initial_balance') as number,
      currentBalance: getCol('current_balance') as number,
      color: getCol('color') as string | undefined,
      icon: getCol('icon') as string | undefined,
      createdAt: new Date(getCol('created_at') as string),
      updatedAt: new Date(getCol('updated_at') as string),
    };
  }
}
