export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Income categories
  { name: 'Salary', type: 'income', icon: '💼', color: '#10B981' },
  { name: 'Business', type: 'income', icon: '💰', color: '#10B981' },
  { name: 'Investment', type: 'income', icon: '📈', color: '#10B981' },
  { name: 'Gift', type: 'income', icon: '🎁', color: '#10B981' },
  { name: 'Other Income', type: 'income', icon: '💵', color: '#10B981' },
  
  // Expense categories
  { name: 'Food', type: 'expense', icon: '🍔', color: '#FF6B8B' },
  { name: 'Transport', type: 'expense', icon: '🚗', color: '#FF6B8B' },
  { name: 'Bills', type: 'expense', icon: '📄', color: '#FF6B8B' },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#FF6B8B' },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#FF6B8B' },
  { name: 'Healthcare', type: 'expense', icon: '🏥', color: '#FF6B8B' },
  { name: 'Education', type: 'expense', icon: '📚', color: '#FF6B8B' },
  { name: 'Other Expense', type: 'expense', icon: '📦', color: '#FF6B8B' },
];
