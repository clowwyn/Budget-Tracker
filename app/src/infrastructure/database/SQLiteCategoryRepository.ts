import { Database } from 'sql.js';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../../domain/models';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { DatabaseService } from './DatabaseService';

export class SQLiteCategoryRepository implements CategoryRepository {
  private db: Database;

  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO categories (id, name, type, icon, color, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, input.name, input.type, input.icon || null, input.color || null, now, now]
    );

    DatabaseService.getInstance().saveDatabase();

    return {
      id,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async findById(id: string): Promise<Category | null> {
    const result = this.db.exec(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.mapToCategory(result[0]);
  }

  async findAll(): Promise<Category[]> {
    const result = this.db.exec('SELECT * FROM categories ORDER BY name');
    
    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((_, index) => this.mapToCategory(result[0], index));
  }

  async findByType(type: 'income' | 'expense'): Promise<Category[]> {
    const result = this.db.exec(
      'SELECT * FROM categories WHERE type = ? ORDER BY name',
      [type]
    );

    if (result.length === 0) {
      return [];
    }

    return result[0].values.map((_, index) => this.mapToCategory(result[0], index));
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.icon !== undefined) {
      updates.push('icon = ?');
      values.push(input.icon);
    }
    if (input.color !== undefined) {
      updates.push('color = ?');
      values.push(input.color);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.run(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    DatabaseService.getInstance().saveDatabase();

    return this.findById(id) as Promise<Category>;
  }

  async delete(id: string): Promise<void> {
    this.db.run('DELETE FROM categories WHERE id = ?', [id]);
    DatabaseService.getInstance().saveDatabase();
  }

  private mapToCategory(result: any, index: number = 0): Category {
    const columns = result.columns;
    const values = result.values[index];
    
    const getCol = (name: string) => {
      const idx = columns.indexOf(name);
      return values[idx];
    };

    return {
      id: getCol('id') as string,
      name: getCol('name') as string,
      type: getCol('type') as 'income' | 'expense',
      icon: getCol('icon') as string | undefined,
      color: getCol('color') as string | undefined,
      createdAt: new Date(getCol('created_at') as string),
      updatedAt: new Date(getCol('updated_at') as string),
    };
  }
}
