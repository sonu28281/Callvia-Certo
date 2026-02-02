import { useState, useEffect } from 'react';
import { VerificationData } from '../VerificationWizard';

interface AadhaarStepProps {
  data: VerificationData;
  onUpdate: (updates: Partial<VerificationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AadhaarStep({ data, onUpdate, onNext, onBack }: AadhaarStepProps) {
  const [aadhaarNumber, setAadhaarNumber] = useState(data.aadhaar?.number || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call actual API to send OTP
      // const response = await fetch(API_ENDPOINTS.AADHAAR.SEND_OTP, {
      //   method: 'POST',
      //   body: JSON.stringify({ aadhaarNumber })
      // });

      // Mock: Simulate OTP sent
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      setTimeLeft(300); // 5 minutes
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call actual API to verify OTP
      // const response = await fetch(API_ENDPOINTS.AADHAAR.VERIFY_OTP, {
      //   method: 'POST',
      //   body: JSON.stringify({ aadhaarNumber, otp })
      // });

      // Mock: Simulate verification success
      await new Promise(resolve => setTimeout(resolve, 1500));

      onUpdate({
        aadhaar: {
          number: aadhaarNumber,
          otp,
          verified: true,
          data: {
            name: 'John Doe',
            dob: '1990-01-15',
            gender: 'Male'
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
      aadhaar: {
        number: '',
        otp: '',
        verified: false
      }
    });
    onNext();
  };

  if (data.verificationTypes.includes('aadhaar') === false) {
    // Skip this step if Aadhaar not selected
    setTimeout(() => onNext(), 0);
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Aadhaar OTP Verification</h3>
        <p className="text-sm text-gray-600 mt-2">
          Verify your customer's identity using their Aadhaar number. An OTP will be sent to their registered mobile.
        </p>
      </div>

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhaar Number (12 digits)
            </label>
            <input
              type="text"
              value={aadhaarNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                setAadhaarNumber(value);
              }}
              placeholder="e.g., 999999999999"
              maxLength={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Aadhaar will be displayed as: XXXX XXXX {aadhaarNumber.slice(-4)}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || aadhaarNumber.length !== 12}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
              loading || aadhaarNumber.length !== 12
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              ✅ OTP sent to XXXXXXX{aadhaarNumber.slice(-4)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP (6 digits)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              placeholder="e.g., 123456"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              OTP expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
              loading || otp.length !== 6
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={() => setOtpSent(false)}
            disabled={timeLeft > 60} // Only allow resend after 60 seconds
            className="w-full py-2 px-4 text-blue-600 hover:text-blue-700 font-semibold disabled:text-gray-400"
          >
            Resend OTP {timeLeft > 60 && `(${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')})`}
          </button>
        </form>
      )}

      {/* Navigation */}
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
