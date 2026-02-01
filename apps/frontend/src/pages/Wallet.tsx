import { useState } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

export default function Wallet() {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  // TODO: Fetch from API
  const walletData = {
    balance: 1250.50,
    currency: 'USD',
    lastTopup: '2024-01-25',
    totalSpent: 8750.25,
  };

  const transactions = [
    {
      id: 'txn_001',
      type: 'credit',
      amount: 500.0,
      description: 'Wallet top-up via Stripe',
      date: '2024-01-25 14:30',
      status: 'completed',
    },
    {
      id: 'txn_002',
      type: 'debit',
      amount: 2.5,
      description: 'KYC verification - John Doe',
      date: '2024-01-25 10:15',
      status: 'completed',
    },
    {
      id: 'txn_003',
      type: 'debit',
      amount: 5.0,
      description: 'Enhanced KYC - Jane Smith',
      date: '2024-01-24 16:45',
      status: 'completed',
    },
    {
      id: 'txn_004',
      type: 'debit',
      amount: 0.8,
      description: 'Voice verification (8 min)',
      date: '2024-01-24 14:20',
      status: 'completed',
    },
    {
      id: 'txn_005',
      type: 'credit',
      amount: 300.0,
      description: 'Wallet top-up via Stripe',
      date: '2024-01-20 09:00',
      status: 'completed',
    },
  ];

  const predefinedAmounts = [100, 500, 1000, 5000];

  const handleRecharge = () => {
    // TODO: Integrate with payment gateway
    console.log('Recharge amount:', rechargeAmount);
    setShowRechargeModal(false);
    setRechargeAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-1">
          Manage your wallet balance and view transaction history
        </p>
      </div>

      {/* Balance Card */}
      <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">Available Balance</p>
            <p className="text-4xl font-bold mt-2">
              ${walletData.balance.toFixed(2)}
            </p>
            <p className="text-primary-200 text-sm mt-2">
              Last top-up: {walletData.lastTopup}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <WalletIcon className="w-8 h-8" />
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
          <div>
            <p className="text-primary-100 text-xs">Total Spent</p>
            <p className="text-xl font-semibold mt-1">
              ${walletData.totalSpent.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => setShowRechargeModal(true)}
            className="btn bg-white text-primary-700 hover:bg-primary-50 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Recharge Wallet
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$245.80</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Top-ups</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$10,000</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Transaction</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$3.50</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Transaction ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Description
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Date & Time
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Amount
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {txn.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {txn.description}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {txn.date}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right font-medium ${
                      txn.type === 'credit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'credit' ? '+' : '-'}$
                    {txn.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="badge badge-success">
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Recharge Wallet
            </h3>
            <p className="text-gray-600 mb-6">
              Select or enter the amount you want to add to your wallet
            </p>

            {/* Predefined Amounts */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setRechargeAmount(amount.toString())}
                  className={`py-3 px-4 border rounded-lg text-sm font-medium transition-colors ${
                    rechargeAmount === amount.toString()
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input pl-8"
                  min="10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRecharge}
                disabled={!rechargeAmount || parseFloat(rechargeAmount) < 10}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Payment
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Minimum recharge amount: $10.00
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
