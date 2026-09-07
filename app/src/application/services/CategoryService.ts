import { Category, CreateCategoryInput, UpdateCategoryInput, DEFAULT_CATEGORIES } from '../../domain/models';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { SQLiteCategoryRepository } from '../../infrastructure/database/SQLiteCategoryRepository';

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new SQLiteCategoryRepository();
  }

  async initializeDefaultCategories(): Promise<void> {
    const existing = await this.categoryRepo.findAll();
    
    if (existing.length === 0) {
      for (const category of DEFAULT_CATEGORIES) {
        await this.categoryRepo.create({
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
        });
      }
    }
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    // Validation
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    if (input.name.trim().length > 30) {
      throw new Error('Category name must be 30 characters or less');
    }
    if (!['income', 'expense'].includes(input.type)) {
      throw new Error('Category type must be either "income" or "expense"');
    }

    return this.categoryRepo.create(input);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
    return this.categoryRepo.findByType(type);
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.categoryRepo.findById(id);
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    return this.categoryRepo.update(id, input);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.categoryRepo.delete(id);
  }
}
