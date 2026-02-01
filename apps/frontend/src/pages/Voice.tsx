import { useState } from 'react';
import { Phone, PhoneCall, PhoneOff, Clock } from 'lucide-react';

export default function Voice() {
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    verificationType: 'biometric',
    maxDuration: '5',
  });

  // TODO: Fetch from API
  const calls = [
    {
      id: 'call_001',
      phoneNumber: '+1234567890',
      type: 'biometric',
      status: 'completed',
      result: 'verified',
      duration: 180,
      initiatedAt: '2024-01-25 10:15',
      cost: 0.3,
    },
    {
      id: 'call_002',
      phoneNumber: '+1234567891',
      type: 'otp',
      status: 'in_progress',
      result: null,
      duration: 45,
      initiatedAt: '2024-01-25 14:30',
      cost: 0.08,
    },
    {
      id: 'call_003',
      phoneNumber: '+1234567892',
      type: 'biometric',
      status: 'completed',
      result: 'failed',
      duration: 120,
      initiatedAt: '2024-01-24 16:45',
      cost: 0.2,
    },
  ];

  const handleInitiate = () => {
    // TODO: API call to initiate voice call
    console.log('Initiating call with:', formData);
    setShowInitiateModal(false);
    setFormData({ phoneNumber: '', verificationType: 'biometric', maxDuration: '5' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice Verification</h1>
          <p className="text-gray-600 mt-1">
            Authenticate users via voice biometrics and OTP
          </p>
        </div>
        <button
          onClick={() => setShowInitiateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Phone className="w-4 h-4 mr-2" />
          Start New Call
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Calls</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">89</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-bold text-green-600 mt-1">76</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">8</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">5</p>
        </div>
      </div>

      {/* Calls Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Recent Calls
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Call ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Phone Number
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Duration
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Initiated
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  Result
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {calls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{call.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {call.phoneNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-info capitalize">
                      {call.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDuration(call.duration)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {call.initiatedAt}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`badge ${
                        call.status === 'completed'
                          ? 'badge-success'
                          : call.status === 'in_progress'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {call.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {call.result ? (
                      <div className="flex items-center justify-center">
                        {call.result === 'verified' ? (
                          <PhoneCall className="w-5 h-5 text-green-600" />
                        ) : (
                          <PhoneOff className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    ${call.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initiate Call Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Start Voice Verification
            </h3>

            <div className="space-y-4">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="+1234567890"
                  className="input"
                />
              </div>

              {/* Verification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setFormData({ ...formData, verificationType: 'biometric' })
                    }
                    className={`py-2 px-3 border rounded-lg text-sm transition-colors ${
                      formData.verificationType === 'biometric'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    Biometric
                  </button>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, verificationType: 'otp' })
                    }
                    className={`py-2 px-3 border rounded-lg text-sm transition-colors ${
                      formData.verificationType === 'otp'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    OTP
                  </button>
                </div>
              </div>

              {/* Max Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.maxDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDuration: e.target.value })
                  }
                  min="1"
                  max="10"
                  className="input"
                />
              </div>

              {/* Estimated Cost */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Cost:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${(parseFloat(formData.maxDuration || '0') * 0.1).toFixed(2)}/min
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInitiateModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiate}
                disabled={!formData.phoneNumber}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Initiate Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
