import { useState, useEffect } from 'react';
import { Plus, Edit2, X, DollarSign, CheckCircle, XCircle, Save, Trash2 } from 'lucide-react';
import { accountsAPI } from '@/utils/api';  // Ta couche API doit exposer ces méthodes

type AccountType = 'CHECKING' | 'SAVINGS' | 'BUSINESS';
type AccountStatus = 'ACTIVE' | 'CLOSED';

interface Account {
  id: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  createdAt: string;
  clientId?: number;
}

const accountTypes = [
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CHECKING', label: 'Checking' },
  { value: 'BUSINESS', label: 'Business' }
] as const;

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    accountType: 'SAVINGS' as AccountType,
    initialDeposit: 0,
    clientId: 2 // Remplacer par l'id client dynamique
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [updateBalanceAmount, setUpdateBalanceAmount] = useState<number>(0);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
     // const response = await accountsAPI.getAccounts();
      //setAccounts(response.data);
    } catch (error: any) {
      showMessage('Failed to fetch accounts: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Création compte
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await accountsAPI.createAccount({
        accountType: newAccount.accountType,
        initialDeposit: newAccount.initialDeposit,
        clientId: newAccount.clientId
      });
      showMessage(`Account ${response.data.accountNumber} created successfully`, 'success');
      setNewAccount({ accountType: 'SAVINGS', initialDeposit: 0, clientId: 2 });
      setShowCreateForm(false);
      fetchAccounts();
    } catch (error: any) {
      showMessage('Failed to create account: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Fermer compte
  const handleCloseAccount = async (accountId: string) => {
    if (window.confirm('Are you sure you want to close this account?')) {
      try {
      
        showMessage('Account closed successfully', 'success');
        fetchAccounts();
      } catch (error: any) {
        showMessage('Failed to close account: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  

  

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Accounts</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Account</span>
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Formulaire création */}
      {showCreateForm && (
        <form onSubmit={handleCreateAccount} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Account</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Account Type</label>
            <select
              value={newAccount.accountType}
              onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value as AccountType })}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Initial Deposit</label>
            <input
              type="number"
              min={0}
              value={newAccount.initialDeposit}
              onChange={(e) => setNewAccount({ ...newAccount, initialDeposit: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowCreateForm(false)}
            className="ml-4 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Liste comptes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 capitalize">
                  {account.accountType.toLowerCase()}
                </h3>
                <p className="text-gray-600 text-sm">•••• {account.accountNumber.slice(-4)}</p>
              </div>
              <div className="flex items-center space-x-2">
                {account.status === 'ACTIVE' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  account.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {account.status.toLowerCase()}
                </span>
              </div>
            </div>

            <p className="text-gray-900 text-xl font-bold mb-4">{formatCurrency(account.balance)}</p>

            {/* Edition compte */}
            {editingAccount?.id === account.id ? (
              <>
                <label className="block mb-1 font-medium">Account Type</label>
                <select
                  value={editingAccount.accountType}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, accountType: e.target.value as AccountType })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 mb-4"
                >
                  {accountTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={editingAccount.status}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, status: e.target.value as AccountStatus })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 mb-4"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <div className="flex space-x-2">
                  <button
                    
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingAccount(null)}
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setEditingAccount(account)}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    title="Edit account info"
                  >
                    <Edit2 className="h-5 w-5" />
                    <span className="sr-only">Edit</span>
                  </button>
                  {account.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCloseAccount(account.id)}
                      className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                      title="Close account"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </button>
                  )}
                </div>

                {/* Mise à jour solde */}
                {account.status === 'ACTIVE' && (
                  <div className="flex space-x-2 items-center">
                    <input
                      type="number"
                      min={0}
                      placeholder="Amount"
                      value={editingAccount?.id === account.id ? '' : updateBalanceAmount || ''}
                      onChange={(e) => setUpdateBalanceAmount(parseFloat(e.target.value) || 0)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                    <button
                      
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <DollarSign className="h-5 w-5" />
                      <span>Update</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounts;
