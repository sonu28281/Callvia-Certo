import { useState } from 'react';
import { VerificationData } from '../VerificationWizard';

interface BankStepProps {
  data: VerificationData;
  onUpdate: (updates: Partial<VerificationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BankStep({ data, onUpdate, onNext, onBack }: BankStepProps) {
  const [accountNumber, setAccountNumber] = useState(data.bank?.accountNumber || '');
  const [ifsc, setIfsc] = useState(data.bank?.ifsc || '');
  const [holderName, setHolderName] = useState(data.bank?.accountHolderName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountNumber || !ifsc || !holderName) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call actual bank verification API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setVerifying(true);
      // Simulate penny-drop verification (5-10 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));

      onUpdate({
        bank: {
          accountNumber,
          ifsc,
          accountHolderName: holderName,
          verified: true,
          data: {
            status: 'Active',
            bankName: 'HDFC Bank'
          }
        }
      });

      onNext();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleSkip = () => {
    onUpdate({
      bank: {
        accountNumber: '',
        ifsc: '',
        accountHolderName: '',
        verified: false
      }
    });
    onNext();
  };

  if (!data.verificationTypes.includes('bank')) {
    setTimeout(() => onNext(), 0);
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Bank Account Verification</h3>
        <p className="text-sm text-gray-600 mt-2">
          Verify the bank account via a small fund transfer (penny-drop).
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g., 1234567890123"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading || verifying}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
            placeholder="e.g., HDFC0000001"
            maxLength={11}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading || verifying}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="e.g., John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading || verifying}
          />
        </div>

        {verifying && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-700">Checking with bank... (5-10 seconds)</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || verifying || !accountNumber || !ifsc || !holderName}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
            loading || verifying || !accountNumber || !ifsc || !holderName
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {loading || verifying ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>

      <div className="flex gap-4 mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={loading || verifying}
          className={`flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold transition-colors ${
            loading || verifying ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          ← Back
        </button>
        <button
          onClick={handleSkip}
          disabled={loading || verifying}
          className={`flex-1 py-2 px-4 font-semibold transition-colors ${
            loading || verifying ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
