import { Account, CreateAccountInput, UpdateAccountInput } from '../models';

export interface AccountRepository {
  create(input: CreateAccountInput): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  update(id: string, input: UpdateAccountInput): Promise<Account>;
  updateBalance(id: string, newBalance: number): Promise<void>;
  delete(id: string): Promise<void>;
}
