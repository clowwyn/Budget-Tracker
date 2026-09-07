import { Category, CreateCategoryInput, UpdateCategoryInput } from '../models';

export interface CategoryRepository {
  create(input: CreateCategoryInput): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findByType(type: 'income' | 'expense'): Promise<Category[]>;
  update(id: string, input: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}
