import { useState } from 'react';
import { AccountType, CreateAccountInput, Account } from '../../domain/models';

interface AccountFormProps {
  account?: Account;
  onSubmit: (input: CreateAccountInput) => Promise<void>;
  onCancel: () => void;
}

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'bank', label: 'Bank Account', icon: '🏦' },
  { value: 'wallet', label: 'E-Wallet', icon: '👛' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
];

const PRESET_COLORS = [
  '#FFB2BC', '#FF6B8B', '#B80045', '#10B981', '#4EDEA3',
  '#E3BDC1', '#8F6F73', '#5B4043', '#F1ECF6', '#DDD8E3',
];

export default function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState<AccountType>(account?.type || 'bank');
  const [currency, setCurrency] = useState(account?.currency || 'USD');
  const [initialBalance, setInitialBalance] = useState(
    account?.initialBalance?.toString() || '0'
  );
  const [color, setColor] = useState(account?.color || PRESET_COLORS[0]);
  const [icon, setIcon] = useState(account?.icon || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Account name is required');
      return;
    }

    const balanceNum = parseFloat(initialBalance);
    if (isNaN(balanceNum)) {
      setError('Invalid balance amount');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        currency,
        initialBalance: balanceNum,
        color,
        icon: icon || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-space-xl">
      {error && (
        <div className="bg-error-container text-on-error-container px-space-lg py-space-md rounded-xl body-md">
          {error}
        </div>
      )}

      {/* Account Name */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          Account Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Main Bank Account"
          className="w-full px-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg"
          disabled={loading}
        />
      </div>

      {/* Account Type */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          Account Type *
        </label>
        <div className="grid grid-cols-2 gap-space-sm">
          {ACCOUNT_TYPES.map((accountType) => (
            <button
              key={accountType.value}
              type="button"
              onClick={() => setType(accountType.value)}
              className={`px-space-lg py-space-md rounded-xl border-2 transition-all ${
                type === accountType.value
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/30 hover:border-outline-variant'
              }`}
              disabled={loading}
            >
              <div className="text-2xl mb-1">{accountType.icon}</div>
              <div className="body-sm font-semibold">{accountType.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Initial Balance */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          Initial Balance *
        </label>
        <div className="flex gap-space-sm">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-space-md py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg font-mono"
            disabled={loading}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="CNY">CNY</option>
          </select>
          <input
            type="number"
            step="0.01"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg font-mono"
            disabled={loading}
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          Color
        </label>
        <div className="flex flex-wrap gap-space-sm">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={() => setColor(presetColor)}
              className={`w-10 h-10 rounded-xl transition-all ${
                color === presetColor
                  ? 'ring-4 ring-primary/30 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: presetColor }}
              disabled={loading}
              aria-label={`Select color ${presetColor}`}
            />
          ))}
        </div>
      </div>

      {/* Icon (Optional) */}
      <div>
        <label className="block body-md font-semibold mb-space-sm">
          Custom Icon (Optional)
        </label>
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Enter an emoji: 🎯"
          maxLength={2}
          className="w-full px-space-lg py-space-md rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all body-lg text-2xl"
          disabled={loading}
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
          className="flex-1 px-space-lg py-space-md rounded-full bg-primary text-white body-md font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}
