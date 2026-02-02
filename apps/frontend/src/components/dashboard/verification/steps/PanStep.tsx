import { useState } from 'react';
import { VerificationData } from '../VerificationWizard';

interface PanStepProps {
  data: VerificationData;
  onUpdate: (updates: Partial<VerificationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PanStep({ data, onUpdate, onNext, onBack }: PanStepProps) {
  const [pan, setPan] = useState(data.pan?.number || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pan || pan.length !== 10) {
      setError('Please enter a valid 10-character PAN');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call actual PAN verification API
      await new Promise(resolve => setTimeout(resolve, 1000));

      onUpdate({
        pan: {
          number: pan,
          verified: true,
          data: {
            name: 'JOHN DOE',
            status: 'ACTIVE'
          }
        }
      });

      onNext();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onUpdate({
      pan: {
        number: '',
        verified: false
      }
    });
    onNext();
  };

  if (!data.verificationTypes.includes('pan')) {
    setTimeout(() => onNext(), 0);
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">PAN Verification</h3>
        <p className="text-sm text-gray-600 mt-2">
          Verify the customer's Permanent Account Number (PAN) against tax records.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN (10 characters)
          </label>
          <input
            type="text"
            value={pan}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().slice(0, 10);
              setPan(value);
            }}
            placeholder="e.g., ABCDE1234F"
            maxLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-lg tracking-widest"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Format: 5 letters, 4 numbers, 1 letter</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || pan.length !== 10}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
            loading || pan.length !== 10
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {loading ? 'Verifying...' : 'Verify PAN'}
        </button>
      </form>

      <div className="flex gap-4 mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 py-2 px-4 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
