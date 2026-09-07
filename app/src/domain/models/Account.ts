export type AccountType = 'bank' | 'wallet' | 'cash' | 'card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  color?: string;
  icon?: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  currency?: string;
  color?: string;
  icon?: string;
}
