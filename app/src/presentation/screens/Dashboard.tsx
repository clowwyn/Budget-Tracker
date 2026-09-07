import { useEffect, useState } from 'react';
import { Account, CreateAccountInput, CreateTransactionInput, Transaction, Category } from '../../domain/models';
import { AccountService } from '../../application/services/AccountService';
import { CategoryService } from '../../application/services/CategoryService';
import { TransactionService } from '../../application/services/TransactionService';
import Modal from '../components/Modal';
import AccountCard from '../components/AccountCard';
import TransactionCard from '../components/TransactionCard';
import AccountForm from './AccountForm';
import AccountDetail from './AccountDetail';
import TransactionForm from './TransactionForm';

type ModalView = 'none' | 'create' | 'edit' | 'detail' | 'income' | 'expense' | 'transfer';

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalView, setModalView] = useState<ModalView>('none');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const accountService = new AccountService();
  const categoryService = new CategoryService();
  const transactionService = new TransactionService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Initialize default categories on first load
      await categoryService.initializeDefaultCategories();

      const [accts, balance, income, expense, txns, cats] = await Promise.all([
        accountService.getAllAccounts(),
        accountService.getTotalBalance(),
        transactionService.getTotalIncome(),
        transactionService.getTotalExpense(),
        transactionService.getAllTransactions(),
        categoryService.getAllCategories(),
      ]);

      setAccounts(accts);
      setTotalBalance(balance);
      setTotalIncome(income);
      setTotalExpense(expense);
      setTransactions(txns.slice(0, 10)); // Show last 10 transactions
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleCreateAccount = async (input: CreateAccountInput) => {
    await accountService.createAccount(input);
    await loadData();
    setModalView('none');
  };

  const handleUpdateAccount = async (input: CreateAccountInput) => {
    if (!selectedAccount) return;
    await accountService.updateAccount(selectedAccount.id, input);
    await loadData();
    setModalView('none');
    setSelectedAccount(null);
  };

  const handleDeleteAccount = async () => {
    await loadData();
    setModalView('none');
    setSelectedAccount(null);
  };

  const openAccountDetail = (account: Account) => {
    setSelectedAccount(account);
    setModalView('detail');
  };

  const openEditForm = (account: Account) => {
    setSelectedAccount(account);
    setModalView('edit');
  };

  const handleCreateTransaction = async (input: CreateTransactionInput) => {
    await transactionService.createTransaction(input);
    await loadData();
    setModalView('none');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/20 px-margin-mobile py-space-lg sticky top-0 z-10">
        <h1 className="headline-lg text-on-background">Bloom Budget</h1>
      </header>

      {/* Content */}
      <main className="px-margin-mobile py-space-2xl max-w-2xl mx-auto">
        {/* Total Balance Card */}
        <div className="bloom-card-elevated p-space-2xl mb-space-2xl">
          <p className="body-sm text-on-surface-variant uppercase tracking-wider mb-2">
            Total Balance
          </p>
          <h2 className="display-lg-mobile font-mono text-primary">
            {formatCurrency(totalBalance)}
          </h2>
        </div>

        {/* Income/Expense Summary */}
        <div className="grid grid-cols-2 gap-space-md mb-space-2xl">
          <div className="bloom-card p-space-lg">
            <p className="body-sm text-on-surface-variant mb-1">Income</p>
            <p className="headline-md font-mono text-tertiary">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="bloom-card p-space-lg">
            <p className="body-sm text-on-surface-variant mb-1">Expenses</p>
            <p className="headline-md font-mono text-error">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>

        {/* Accounts Section */}
        <section className="mb-space-2xl">
          <div className="flex items-center justify-between mb-space-lg">
            <h3 className="headline-sm">Accounts</h3>
            <button
              onClick={() => setModalView('create')}
              className="px-space-lg py-space-sm bg-primary text-white rounded-full body-md font-semibold hover:bg-primary-container transition-colors"
            >
              + Add Account
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="bloom-card p-space-2xl text-center">
              <p className="body-lg text-on-surface-variant mb-space-md">
                No accounts yet. Create your first account to get started.
              </p>
              <button
                onClick={() => setModalView('create')}
                className="px-space-xl py-space-md bg-primary text-white rounded-full body-md font-semibold hover:bg-primary-container transition-colors"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="space-y-space-md">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onClick={() => openAccountDetail(account)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <section className="mb-space-2xl">
            <h3 className="headline-sm mb-space-lg">Recent Transactions</h3>
            <div className="space-y-space-sm">
              {transactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId);
                return (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    category={category}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h3 className="headline-sm mb-space-lg">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-space-md">
            <button
              onClick={() => setModalView('income')}
              disabled={accounts.length === 0}
              className="bloom-card p-space-lg text-left hover:shadow-bloom-2 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-3xl mb-2 block">💰</span>
              <p className="body-md font-semibold">Add Income</p>
            </button>
            <button
              onClick={() => setModalView('expense')}
              disabled={accounts.length === 0}
              className="bloom-card p-space-lg text-left hover:shadow-bloom-2 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-3xl mb-2 block">💸</span>
              <p className="body-md font-semibold">Add Expense</p>
            </button>
          </div>
          {accounts.length >= 2 && (
            <button
              onClick={() => setModalView('transfer')}
              className="w-full mt-space-md bloom-card p-space-lg text-left hover:shadow-bloom-2 transition-shadow"
            >
              <div className="flex items-center gap-space-md">
                <span className="text-3xl">🔄</span>
                <p className="body-md font-semibold">Transfer Between Accounts</p>
              </div>
            </button>
          )}
        </section>
      </main>

      {/* Modals */}
      <Modal
        isOpen={modalView === 'create'}
        onClose={() => setModalView('none')}
        title="Create Account"
      >
        <AccountForm
          onSubmit={handleCreateAccount}
          onCancel={() => setModalView('none')}
        />
      </Modal>

      <Modal
        isOpen={modalView === 'edit'}
        onClose={() => {
          setModalView('none');
          setSelectedAccount(null);
        }}
        title="Edit Account"
      >
        <AccountForm
          account={selectedAccount || undefined}
          onSubmit={handleUpdateAccount}
          onCancel={() => {
            setModalView('none');
            setSelectedAccount(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={modalView === 'detail'}
        onClose={() => {
          setModalView('none');
          setSelectedAccount(null);
        }}
        title="Account Details"
      >
        {selectedAccount && (
          <AccountDetail
            accountId={selectedAccount.id}
            onEdit={openEditForm}
            onDelete={handleDeleteAccount}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalView === 'income'}
        onClose={() => setModalView('none')}
        title="Add Income"
      >
        <TransactionForm
          type="income"
          onSubmit={handleCreateTransaction}
          onCancel={() => setModalView('none')}
        />
      </Modal>

      <Modal
        isOpen={modalView === 'expense'}
        onClose={() => setModalView('none')}
        title="Add Expense"
      >
        <TransactionForm
          type="expense"
          onSubmit={handleCreateTransaction}
          onCancel={() => setModalView('none')}
        />
      </Modal>

      <Modal
        isOpen={modalView === 'transfer'}
        onClose={() => setModalView('none')}
        title="Transfer Money"
      >
        <TransactionForm
          type="transfer"
          onSubmit={handleCreateTransaction}
          onCancel={() => setModalView('none')}
        />
      </Modal>
    </div>
  );
}
