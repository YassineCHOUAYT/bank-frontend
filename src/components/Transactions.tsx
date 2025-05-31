
import { useState, useEffect } from 'react';
import { ArrowUpDown, ArrowDownToLine, ArrowUpFromLine, Calendar } from 'lucide-react';
import { transactionsAPI, accountsAPI } from '@/utils/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  sourceAccountId?: string;
  destinationAccountId?: string;
  accountId?: string;
  createdAt: string;
  status: string;
}

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<'transfer' | 'deposit' | 'withdraw' | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [transferForm, setTransferForm] = useState({
    sourceAccountId: '',
    destinationAccountId: '',
    amount: 0,
  });

  const [depositForm, setDepositForm] = useState({
    accountId: '',
    amount: 0,
  });

  const [withdrawForm, setWithdrawForm] = useState({
    accountId: '',
    amount: 0,
  });

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchData = async () => {
    try {
      const [transactionsRes, accountsRes] = await Promise.all([
        transactionsAPI.getTransactions(),
        accountsAPI.getAccounts(),
      ]);
      setTransactions(transactionsRes.data);
      setAccounts(accountsRes.data);
    } catch (error) {
      showMessage('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsAPI.transfer(
        transferForm.sourceAccountId,
        transferForm.destinationAccountId,
        transferForm.amount
      );
      setTransferForm({ sourceAccountId: '', destinationAccountId: '', amount: 0 });
      setActiveForm(null);
      fetchData();
      showMessage('Transfer completed successfully', 'success');
    } catch (error) {
      showMessage('Transfer failed', 'error');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsAPI.deposit(depositForm.accountId, depositForm.amount);
      setDepositForm({ accountId: '', amount: 0 });
      setActiveForm(null);
      fetchData();
      showMessage('Deposit completed successfully', 'success');
    } catch (error) {
      showMessage('Deposit failed', 'error');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsAPI.withdraw(withdrawForm.accountId, withdrawForm.amount);
      setWithdrawForm({ accountId: '', amount: 0 });
      setActiveForm(null);
      fetchData();
      showMessage('Withdrawal completed successfully', 'success');
    } catch (error) {
      showMessage('Withdrawal failed', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Transactions</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Transaction Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setActiveForm('transfer')}
          className="flex items-center justify-center space-x-3 bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowUpDown className="h-6 w-6" />
          <span className="font-medium">Transfer</span>
        </button>
        
        <button
          onClick={() => setActiveForm('deposit')}
          className="flex items-center justify-center space-x-3 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors"
        >
          <ArrowDownToLine className="h-6 w-6" />
          <span className="font-medium">Deposit</span>
        </button>
        
        <button
          onClick={() => setActiveForm('withdraw')}
          className="flex items-center justify-center space-x-3 bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-700 transition-colors"
        >
          <ArrowUpFromLine className="h-6 w-6" />
          <span className="font-medium">Withdraw</span>
        </button>
      </div>

      {/* Transaction Forms */}
      {activeForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {activeForm === 'transfer' && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Transfer Money</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Account
                  </label>
                  <select
                    value={transferForm.sourceAccountId}
                    onChange={(e) => setTransferForm({ ...transferForm, sourceAccountId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountType} - ***{account.accountNumber.slice(-4)} - {formatCurrency(account.balance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Account
                  </label>
                  <input
                    type="text"
                    value={transferForm.destinationAccountId}
                    onChange={(e) => setTransferForm({ ...transferForm, destinationAccountId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter destination account ID"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activeForm === 'deposit' && (
            <form onSubmit={handleDeposit} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Deposit Money</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account
                </label>
                <select
                  value={depositForm.accountId}
                  onChange={(e) => setDepositForm({ ...depositForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountType} - ***{account.accountNumber.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activeForm === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Withdraw Money</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account
                </label>
                <select
                  value={withdrawForm.accountId}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountType} - ***{account.accountNumber.slice(-4)} - {formatCurrency(account.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No transactions found
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'TRANSFER' ? 'bg-blue-100' :
                      transaction.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {transaction.type === 'TRANSFER' && <ArrowUpDown className="h-5 w-5 text-blue-600" />}
                      {transaction.type === 'DEPOSIT' && <ArrowDownToLine className="h-5 w-5 text-green-600" />}
                      {transaction.type === 'WITHDRAW' && <ArrowUpFromLine className="h-5 w-5 text-orange-600" />}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-800">{transaction.type}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(transaction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
