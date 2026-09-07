import { Transaction, Category } from '../../domain/models';

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category | null;
  onClick?: () => void;
}

export default function TransactionCard({
  transaction,
  category,
  onClick,
}: TransactionCardProps) {
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

  const getIcon = () => {
    if (transaction.type === 'transfer') return '🔄';
    if (category?.icon) return category.icon;
    return transaction.type === 'income' ? '💰' : '💸';
  };

  const getColor = () => {
    if (transaction.type === 'income') return 'text-tertiary';
    if (transaction.type === 'expense') return 'text-error';
    return 'text-on-surface';
  };

  const getBgColor = () => {
    if (transaction.type === 'income') return 'bg-tertiary/10';
    if (transaction.type === 'expense') return 'bg-error/10';
    return 'bg-primary/10';
  };

  return (
    <button
      onClick={onClick}
      className="bloom-card p-space-md flex items-center gap-space-md w-full hover:shadow-bloom-2 transition-shadow text-left"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getBgColor()}`}
      >
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="body-md font-semibold truncate">
          {transaction.description}
        </h4>
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <p className="body-sm">{formatDate(transaction.date)}</p>
          {category && (
            <>
              <span className="text-xs">•</span>
              <p className="body-sm">{category.name}</p>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`headline-sm font-mono ${getColor()}`}>
          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
      </div>
    </button>
  );
}
