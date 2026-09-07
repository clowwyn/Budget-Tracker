import { Account } from '../../domain/models';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
}

export default function AccountCard({ account, onClick }: AccountCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getAccountTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return '🏦';
      case 'wallet':
        return '👛';
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      default:
        return '💰';
    }
  };

  return (
    <button
      onClick={onClick}
      className="bloom-card p-space-lg flex items-center justify-between w-full hover:shadow-bloom-2 transition-shadow text-left"
    >
      <div className="flex items-center gap-space-md">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{
            backgroundColor: account.color || '#F1ECF6',
          }}
        >
          {account.icon || getAccountTypeIcon(account.type)}
        </div>
        <div>
          <h4 className="headline-sm">{account.name}</h4>
          <p className="body-sm text-on-surface-variant capitalize">
            {account.type}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="headline-md font-mono">
          {formatCurrency(account.currentBalance, account.currency)}
        </p>
        {account.currentBalance !== account.initialBalance && (
          <p className="body-sm text-on-surface-variant">
            Initial: {formatCurrency(account.initialBalance, account.currency)}
          </p>
        )}
      </div>
    </button>
  );
}
