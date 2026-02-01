import { useState } from 'react';
import { UserCheck, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function KYC() {
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [formData, setFormData] = useState({
    endUserId: '',
    documentTypes: [] as string[],
    biometricRequired: false,
  });

  // TODO: Fetch from API
  const verifications = [
    {
      id: 'kyc_001',
      endUserName: 'John Doe',
      endUserId: 'user_123',
      documentTypes: ['Passport', 'Driving License'],
      status: 'completed',
      result: 'approved',
      initiatedAt: '2024-01-25 10:15',
      completedAt: '2024-01-25 10:18',
      cost: 2.5,
    },
    {
      id: 'kyc_002',
      endUserName: 'Jane Smith',
      endUserId: 'user_456',
      documentTypes: ['Passport'],
      status: 'pending',
      result: null,
      initiatedAt: '2024-01-25 14:30',
      completedAt: null,
      cost: 5.0,
    },
    {
      id: 'kyc_003',
      endUserName: 'Bob Johnson',
      endUserId: 'user_789',
      documentTypes: ['National ID'],
      status: 'completed',
      result: 'rejected',
      initiatedAt: '2024-01-24 16:45',
      completedAt: '2024-01-24 16:50',
      cost: 2.5,
    },
  ];

  const documentTypeOptions = [
    'Passport',
    'Driving License',
    'National ID',
    'Bank Statement',
  ];

  const handleInitiate = () => {
    // TODO: API call to initiate KYC
    console.log('Initiating KYC with:', formData);
    setShowInitiateModal(false);
    setFormData({ endUserId: '', documentTypes: [], biometricRequired: false });
  };

  const toggleDocumentType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      documentTypes: prev.documentTypes.includes(type)
        ? prev.documentTypes.filter(t => t !== type)
        : [...prev.documentTypes, type]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-1">
            Verify customer identity with document checks
          </p>
        </div>
        <button
          onClick={() => setShowInitiateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Start New Verification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Verifications</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">145</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">128</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">12</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">5</p>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Recent Verifications
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Session ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  End User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Documents
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
              {verifications.map((kyc) => (
                <tr key={kyc.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{kyc.id}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{kyc.endUserName}</div>
                    <div className="text-xs text-gray-500">{kyc.endUserId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {kyc.documentTypes.map((doc) => (
                        <span key={doc} className="badge badge-info text-xs">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {kyc.initiatedAt}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`badge ${
                        kyc.status === 'completed'
                          ? 'badge-success'
                          : 'badge-warning'
                      }`}
                    >
                      {kyc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {kyc.result ? (
                      <div className="flex items-center justify-center">
                        {kyc.result === 'approved' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    ${kyc.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initiate KYC Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Start KYC Verification
            </h3>

            <div className="space-y-4">
              {/* End User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End User ID *
                </label>
                <input
                  type="text"
                  value={formData.endUserId}
                  onChange={(e) =>
                    setFormData({ ...formData, endUserId: e.target.value })
                  }
                  placeholder="user_123"
                  className="input"
                />
              </div>

              {/* Document Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Types *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {documentTypeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleDocumentType(type)}
                      className={`py-2 px-3 border rounded-lg text-sm transition-colors ${
                        formData.documentTypes.includes(type)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Biometric */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="biometric"
                  checked={formData.biometricRequired}
                  onChange={(e) =>
                    setFormData({ ...formData, biometricRequired: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="biometric" className="ml-2 text-sm text-gray-700">
                  Require biometric verification
                </label>
              </div>

              {/* Estimated Cost */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Cost:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${(formData.documentTypes.length * 2.5).toFixed(2)}
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
                disabled={!formData.endUserId || formData.documentTypes.length === 0}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Initiate Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
