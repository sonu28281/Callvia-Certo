import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { VerificationData } from '../VerificationWizard';

interface ResultsStepProps {
  data: VerificationData;
  onClose: () => void;
}

export default function ResultsStep({ data, onClose }: ResultsStepProps) {
  // Determine overall status based on verifications
  const determineStatus = (): { status: 'pass' | 'review' | 'fail'; message: string } => {
    const verifications = [
      data.aadhaar?.verified,
      data.pan?.verified,
      data.bank?.verified
    ].filter(Boolean);

    if (verifications.length === 0) {
      return { status: 'review', message: 'No verifications completed' };
    }

    const allVerified = verifications.length === data.verificationTypes.length;
    if (allVerified) {
      return { status: 'pass', message: 'All verifications successful' };
    }

    return { status: 'review', message: 'Some verifications require review' };
  };

  const result = determineStatus();
  const statusIcon = result.status === 'pass' ? <CheckCircle2 className="w-12 h-12 text-green-500" /> :
    result.status === 'review' ? <AlertCircle className="w-12 h-12 text-yellow-500" /> :
    <XCircle className="w-12 h-12 text-red-500" />;

  const statusColor = result.status === 'pass' ? 'bg-green-50 border-green-200' :
    result.status === 'review' ? 'bg-yellow-50 border-yellow-200' :
    'bg-red-50 border-red-200';

  const statusTextColor = result.status === 'pass' ? 'text-green-800' :
    result.status === 'review' ? 'text-yellow-800' :
    'text-red-800';

  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        {statusIcon}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Verification {result.status === 'pass' ? 'Complete ✅' : result.status === 'review' ? 'Needs Review ⚠️' : 'Failed ❌'}
      </h3>

      <p className="text-gray-600 mb-6">{result.message}</p>

      {/* Verification Summary */}
      <div className={`rounded-lg border-2 p-6 mb-6 ${statusColor}`}>
        <div className="space-y-3">
          {/* Customer Info */}
          <div className="text-left">
            <p className={`text-sm font-semibold ${statusTextColor}`}>Customer Information</p>
            <p className="text-gray-700">Name: {data.customerName}</p>
            <p className="text-gray-700">Phone: {data.customerPhone}</p>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className={`text-sm font-semibold ${statusTextColor}`}>Verification Results</p>
          </div>

          {/* Aadhaar Result */}
          {data.verificationTypes.includes('aadhaar') && (
            <div className="text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Aadhaar:</span>
                <span className={data.aadhaar?.verified ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                  {data.aadhaar?.verified ? '✅ Verified' : '⏳ Skipped'}
                </span>
              </div>
              {data.aadhaar?.data && (
                <div className="text-xs text-gray-600 ml-4">
                  <p>Name: {data.aadhaar.data.name}</p>
                  <p>DOB: {data.aadhaar.data.dob}</p>
                </div>
              )}
            </div>
          )}

          {/* PAN Result */}
          {data.verificationTypes.includes('pan') && (
            <div className="text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">PAN:</span>
                <span className={data.pan?.verified ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                  {data.pan?.verified ? '✅ Verified' : '⏳ Skipped'}
                </span>
              </div>
              {data.pan?.data && (
                <div className="text-xs text-gray-600 ml-4">
                  <p>Name: {data.pan.data.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Bank Result */}
          {data.verificationTypes.includes('bank') && (
            <div className="text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Bank Account:</span>
                <span className={data.bank?.verified ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                  {data.bank?.verified ? '✅ Verified' : '⏳ Skipped'}
                </span>
              </div>
              {data.bank?.data && (
                <div className="text-xs text-gray-600 ml-4">
                  <p>Bank: {data.bank.data.bankName}</p>
                  <p>Account: ****{data.bank.accountNumber.slice(-4)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {result.status === 'pass' && (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              ✅ Accept & Onboard
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              📊 Download Report
            </button>
          </>
        )}
        {result.status === 'review' && (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              🔍 Request More Info
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-yellow-500 text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
            >
              Start New
            </button>
          </>
        )}
        {result.status === 'fail' && (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              ❌ Reject
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Start New
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Verification ID: VER-{new Date().getTime()}
      </p>
    </div>
  );
}
