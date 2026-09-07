import { useEffect, useState } from 'react';
import { Account, Transaction } from '../../domain/models';
import { AccountService } from '../../application/services/AccountService';
import { TransactionService } from '../../application/services/TransactionService';

interface AccountDetailProps {
  accountId: string;
  onEdit: (account: Account) => void;
  onDelete: () => void;
}

export default function AccountDetail({
  accountId,
  onEdit,
  onDelete,
}: AccountDetailProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const accountService = new AccountService();
  const transactionService = new TransactionService();

  useEffect(() => {
    loadData();
  }, [accountId]);

  const loadData = async () => {
    try {
      const [acct, txns] = await Promise.all([
        accountService.getAccount(accountId),
        transactionService.getTransactionsByAccount(accountId),
      ]);
      setAccount(acct);
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load account details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    try {
      await accountService.deleteAccount(account.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Make sure all transactions are deleted first.');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-space-3xl">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-space-3xl">
        <p className="body-lg text-on-surface-variant">Account not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-space-2xl">
      {/* Account Header */}
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-space-md"
          style={{ backgroundColor: account.color || '#F1ECF6' }}
        >
          {account.icon || '💳'}
        </div>
        <h3 className="headline-lg mb-space-xs">{account.name}</h3>
        <p className="body-md text-on-surface-variant capitalize mb-space-md">
          {account.type}
        </p>
        <p className="display-lg-mobile font-mono text-primary">
          {formatCurrency(account.currentBalance, account.currency)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-space-md">
        <div className="bloom-card p-space-lg text-center">
          <p className="body-sm text-on-surface-variant mb-1">Initial Balance</p>
          <p className="headline-sm font-mono">
            {formatCurrency(account.initialBalance, account.currency)}
          </p>
        </div>
        <div className="bloom-card p-space-lg text-center">
          <p className="body-sm text-on-surface-variant mb-1">Transactions</p>
          <p className="headline-sm font-mono">{transactions.length}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h4 className="headline-sm mb-space-md">Recent Transactions</h4>
        {transactions.length === 0 ? (
          <div className="bloom-card p-space-2xl text-center">
            <p className="body-md text-on-surface-variant">
              No transactions yet
            </p>
          </div>
        ) : (
          <div className="space-y-space-sm">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="bloom-card p-space-md flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="body-md font-semibold">{transaction.description}</p>
                  <p className="body-sm text-on-surface-variant">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <p
                  className={`headline-sm font-mono ${
                    transaction.type === 'income'
                      ? 'text-tertiary'
                      : transaction.type === 'expense'
                      ? 'text-error'
                      : 'text-on-surface'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-space-md pt-space-md border-t border-outline-variant/20">
        <button
          onClick={() => onEdit(account)}
          className="w-full px-space-lg py-space-md rounded-full bg-primary text-white body-md font-semibold hover:bg-primary-container transition-colors"
        >
          Edit Account
        </button>

        {showDeleteConfirm ? (
          <div className="space-y-space-sm">
            <p className="body-sm text-error text-center">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-space-sm">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-space-lg py-space-sm rounded-full border-2 border-outline-variant/30 body-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-space-lg py-space-sm rounded-full bg-error text-white body-sm font-semibold hover:bg-error/90 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-space-lg py-space-sm rounded-full border-2 border-error text-error body-md font-semibold hover:bg-error/5 transition-colors"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}
