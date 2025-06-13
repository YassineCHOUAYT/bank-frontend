import { useState } from 'react';
import {
  ArrowUpDown,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { transactionsAPI } from '@/utils/api';

const Transactions = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [activeForm, setActiveForm] = useState<'transfer' | 'deposit' | 'withdraw' | null>(null);

  const [transferForm, setTransferForm] = useState({
    amount: 0,
    sourceAccountId: '',
    destinationAccountId: ''
    
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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsAPI.transfer(
        transferForm.amount,
        transferForm.sourceAccountId,
        transferForm.destinationAccountId
        
      );
      setTransferForm({ sourceAccountId: '', destinationAccountId: '', amount: 0 });
      setActiveForm(null);
      showMessage('Transfer completed successfully', 'success');
    } catch {
      showMessage('Transfer failed', 'error');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsAPI.deposit(depositForm.accountId, depositForm.amount);
      setDepositForm({ accountId: '', amount: 0 });
      setActiveForm(null);
      showMessage('Deposit completed successfully', 'success');
    } catch {
      showMessage('Deposit failed', 'error');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsAPI.withdraw(withdrawForm.accountId, withdrawForm.amount);
      setWithdrawForm({ accountId: '', amount: 0 });
      setActiveForm(null);
      showMessage('Withdrawal completed successfully', 'success');
    } catch {
      showMessage('Withdrawal failed', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Transaction Actions</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setActiveForm('transfer')}
          className="bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition"
        >
          <ArrowUpDown className="h-5 w-5" />
          Transfer
        </button>
        <button
          onClick={() => setActiveForm('deposit')}
          className="bg-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
        >
          <ArrowDownToLine className="h-5 w-5" />
          Deposit
        </button>
        <button
          onClick={() => setActiveForm('withdraw')}
          className="bg-orange-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-700 transition"
        >
          <ArrowUpFromLine className="h-5 w-5" />
          Withdraw
        </button>
      </div>

      {activeForm === 'transfer' && (
        <form onSubmit={handleTransfer} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold mb-2">Transfer Money</h2>
          <input
            type="text"
            placeholder="Source Account ID"
            value={transferForm.sourceAccountId}
            onChange={(e) =>
              setTransferForm({ ...transferForm, sourceAccountId: e.target.value })
            }
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Destination Account ID"
            value={transferForm.destinationAccountId}
            onChange={(e) =>
              setTransferForm({ ...transferForm, destinationAccountId: e.target.value })
            }
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
          />
          <input
            type="number"
            placeholder="Amount"
            value={transferForm.amount}
            onChange={(e) =>
              setTransferForm({ ...transferForm, amount: parseFloat(e.target.value) })
            }
            required
            min="0.01"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setActiveForm(null)}
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {activeForm === 'deposit' && (
        <form onSubmit={handleDeposit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold mb-2">Deposit Money</h2>
          <input
            type="text"
            placeholder="Account ID"
            value={depositForm.accountId}
            onChange={(e) =>
              setDepositForm({ ...depositForm, accountId: e.target.value })
            }
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-green-300"
          />
          <input
            type="number"
            placeholder="Amount"
            value={depositForm.amount}
            onChange={(e) =>
              setDepositForm({ ...depositForm, amount: parseFloat(e.target.value) })
            }
            required
            min="0.01"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-green-300"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setActiveForm(null)}
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {activeForm === 'withdraw' && (
        <form onSubmit={handleWithdraw} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold mb-2">Withdraw Money</h2>
          <input
            type="text"
            placeholder="Account ID"
            value={withdrawForm.accountId}
            onChange={(e) =>
              setWithdrawForm({ ...withdrawForm, accountId: e.target.value })
            }
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-orange-300"
          />
          <input
            type="number"
            placeholder="Amount"
            value={withdrawForm.amount}
            onChange={(e) =>
              setWithdrawForm({ ...withdrawForm, amount: parseFloat(e.target.value) })
            }
            required
            min="0.01"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-orange-300"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setActiveForm(null)}
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Transactions;
