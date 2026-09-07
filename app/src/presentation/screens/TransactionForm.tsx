import { useState, useEffect } from 'react';
import {
  TransactionType,
  CreateTransactionInput,
  Category,
  Account,
} from '../../domain/models';
import { CategoryService } from '../../application/services/CategoryService';
import { AccountService } from '../../application/services/AccountService';

interface TransactionFormProps {
  type: TransactionType;
  preselectedAccountId?: string;
  onSubmit: (input: CreateTransactionInput) => Promise<void>;
  onCancel: () => void;
}

export default function TransactionForm({
  type,
  preselectedAccountId,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accountId, setAccountId] = useState(preselectedAccountId || '');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryService = new CategoryService();
  const accountService = new AccountService();

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    try {
      const [accts, cats] = await Promise.all([
        accountService.getAllAccounts(),
        type === 'transfer'
          ? Promise.resolve([])
          : categoryService.getCategoriesByType(
              type === 'income' ? 'income' : 'expense'
            ),
      ]);
      setAccounts(accts);
      setCategories(cats);

      // Set default account if only one exists
      if (accts.length === 1 && !accountId) {
        setAccountId(accts[0].id);
      }

      // Set default category if available
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    if (type === 'transfer' && !toAccountId) {
      setError('Please select a destination account');
      return;
    }

    if (type === 'transfer' && accountId === toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const account = accounts.find((a) => a.id === accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      await onSubmit({
        accountId,
        type,
        amount: amountNum,
        currency: account.currency,
        categoryId: type === 'transfer' ? null : categoryId || null,
        description: description.trim(),
        date: new Date(date),
        toAccountId: type === 'transfer' ? toAccountId : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'income':
        return {
          title: 'Add Income',
          icon: '💰',
          color: 'text-tertiary',
          bgColor: 'bg-tertiary/10',
        };
      case 'expense':
        return {
          title: 'Add Expense',
          icon: '💸',
          color: 'text-error',
          bgColor: 'bg-error/10',
        };
      case 'transfer':
        return {
          title: 'Transfer Money',
          icon: '🔄',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <form onSubmit={handleSubmit} className="space-y-space-xl">
      {/* Header */}
      <div className={`${config.bgColor} rounded-2xl p-space-lg text-center`}>
        <div className="text-5xl mb-space-sm">{config.icon}</div>
        <h3 className={`headline-md ${config.color}`}>{config.title}</h3>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container px-space-lg py-space-md rounded-xl body-md">
          {error}
        </div>
      )}

      {/* Account Selection */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          {type === 'transfer' ? 'From Account' : 'Account'} *
        </label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full px-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg"
          disabled={loading || !!preselectedAccountId}
          required
        >
          <option value="">Select an account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.icon || '💳'} {account.name} ({account.currency}{' '}
              {account.currentBalance.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* To Account (for transfers) */}
      {type === 'transfer' && (
        <div>
          <label className="block body-md font-semibold mb-space-sm">
            To Account *
          </label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full px-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg"
            disabled={loading}
            required
          >
            <option value="">Select destination account</option>
            {accounts
              .filter((a) => a.id !== accountId)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon || '💳'} {account.name} ({account.currency}{' '}
                  {account.currentBalance.toFixed(2)})
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          Amount *
        </label>
        <div className="relative">
          <span className="absolute left-space-lg top-1/2 -translate-y-1/2 text-2xl text-on-surface-variant">
            {config.icon}
          </span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-16 pr-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all text-2xl font-mono"
            disabled={loading}
            required
          />
        </div>
      </div>

      {/* Category */}
      {type !== 'transfer' && categories.length > 0 && (
        <div>
          <label className="block body-md font-semibold mb-space-sm">
            Category
          </label>
          <div className="grid grid-cols-2 gap-space-sm max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={`px-space-md py-space-md rounded-xl border-2 transition-all text-left ${
                  categoryId === category.id
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/30 hover:border-outline-variant'
                }`}
                disabled={loading}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="text-xl">{category.icon}</span>
                  <span className="body-sm font-semibold">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          Description *
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'income'
              ? 'e.g., Monthly salary'
              : type === 'expense'
              ? 'e.g., Grocery shopping'
              : 'e.g., Transfer to savings'
          }
          className="w-full px-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg"
          disabled={loading}
          required
        />
      </div>

      {/* Date */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">Date *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg"
          disabled={loading}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-space-md pt-space-md">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-space-lg py-space-md rounded-full border-2 border-outline-variant/30 hover:border-outline-variant body-md font-semibold transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`flex-1 px-space-lg py-space-md rounded-full text-white body-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            type === 'income'
              ? 'bg-tertiary hover:bg-tertiary-container'
              : type === 'expense'
              ? 'bg-error hover:bg-error/90'
              : 'bg-primary hover:bg-primary-container'
          }`}
          disabled={loading}
        >
          {loading ? 'Saving...' : config.title}
        </button>
      </div>
    </form>
  );
}
