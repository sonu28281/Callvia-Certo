import { useState } from 'react';
import { UserCheck, Upload, CheckCircle, XCircle, LayoutGrid, LayoutList, Sparkles, Eye, Download, Clock, AlertCircle } from 'lucide-react';

export default function KYC() {
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastSentEmail, setLastSentEmail] = useState('');
  const [formData, setFormData] = useState({
    endUserName: '',
    endUserEmail: '',
    endUserPhone: '',
    documentTypes: [] as string[],
    biometricRequired: false,
    verificationMethods: {
      livenessCheck: false,
      digilocker: false,
      documentUpload: true, // Default
    },
    // Override Support
    isOverride: false,
    overrideReason: '',
    overrideNotes: '',
    additionalModules: [] as string[],
  });

  // TODO: Fetch from API
  const [verifications, setVerifications] = useState<Array<{
    id: string;
    endUserName: string;
    endUserId: string;
    documentTypes: string[];
    status: string;
    result: string | null;
    initiatedAt: string;
    completedAt: string | null;
    cost: number;
    isOverride?: boolean;
    costDelta?: number;
  }>>([
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
  ]);

  const documentTypeOptions = [
    'Passport',
    'Driving License',
    'National ID',
    'Bank Statement',
  ];

  const handleInitiate = async () => {
    try {
      console.log('🚀 Sending API request to backend...');
      
      // Call backend API to send real email
      const response = await fetch('/api/v1/kyc/inhouse/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endUserName: formData.endUserName,
          endUserEmail: formData.endUserEmail,
          endUserPhone: formData.endUserPhone,
          documentTypes: formData.documentTypes,
          verificationMethods: formData.verificationMethods,
          biometricRequired: formData.biometricRequired,
          // Override params
          isOverride: formData.isOverride,
          overrideReason: formData.overrideReason,
          overrideNotes: formData.overrideNotes,
          additionalModules: formData.additionalModules,
        }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        // Create new verification for UI
        const newVerification = {
          id: data.data.sessionId,
          endUserName: formData.endUserName,
          endUserId: formData.endUserEmail.split('@')[0],
          documentTypes: formData.documentTypes,
          status: 'pending',
          result: null,
          initiatedAt: new Date().toLocaleString('en-US', { 
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          completedAt: null,
          cost: data.data.totalCost || 1.65,
          isOverride: data.data.isOverride || false,
          costDelta: data.data.costDelta || 0,
        };
        
        // Add to list
        setVerifications([newVerification, ...verifications]);

        // Show success message
        setLastSentEmail(formData.endUserEmail);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        
        // Close modal and reset form
        setShowInitiateModal(false);
        setFormData({ 
          endUserName: '', 
          endUserEmail: '', 
          endUserPhone: '', 
          documentTypes: [], 
          biometricRequired: false,
          verificationMethods: {
            livenessCheck: false,
            digilocker: false,
            documentUpload: true,
          },
          isOverride: false,
          overrideReason: '',
          overrideNotes: '',
          additionalModules: [],
        });

        console.log('✅ Email sent successfully to:', formData.endUserEmail);
      } else {
        console.error('❌ API Error:', data);
        alert('API Error: ' + (data.error?.message || JSON.stringify(data)));
      }
    } catch (error: any) {
      console.error('❌ Network Error:', error);
      alert('Network Error: ' + error.message + '\n\nPlease check:\n1. Backend is running on port 3000\n2. Check browser console for details');
    }
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
    <div className="space-y-6">      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  ✅ KYC Link Sent Successfully!
                </h3>
                <p className="text-sm text-green-800">
                  Verification link has been sent to <strong>{lastSentEmail}</strong>
                </p>
                <p className="text-xs text-green-700 mt-2">
                  📧 Customer will receive an email with a secure link to complete their KYC verification.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-600 hover:text-green-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg transition-transform duration-300 hover:scale-110 hover:rotate-3">
            <UserCheck className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              KYC Verification
              <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-sm text-gray-600">Manage identity verification requests</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'cards'
                  ? 'bg-white text-primary-600 shadow-sm scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:scale-105'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:scale-105'
              }`}
              title="Table View"
            >
              <LayoutList className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setShowInitiateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Start New Verification
          </button>
        </div>
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

      {/* Verifications - Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {verifications.map((kyc) => (
            <div key={kyc.id} className="card hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  kyc.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                } transition-all duration-300 hover:scale-110`}>
                  {kyc.status === 'completed' ? (
                    <CheckCircle className="h-3 w-3 animate-pulse" />
                  ) : (
                    <Clock className="h-3 w-3 animate-spin" />
                  )}
                  {kyc.status}
                </span>
                <span className="text-xs text-gray-500">{kyc.id}</span>
              </div>

              {/* User Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{kyc.endUserName}</h3>
                  {kyc.isOverride && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                      🔧 Custom
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{kyc.endUserId}</p>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {kyc.documentTypes.map((doc) => (
                      <span key={doc} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initiated:</span>
                  <span className="font-medium text-gray-900">{kyc.initiatedAt}</span>
                </div>
                {kyc.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-gray-900">{kyc.completedAt}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Result:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    kyc.result === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : kyc.result === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {kyc.result === 'approved' && <CheckCircle className="h-3 w-3" />}
                    {kyc.result === 'rejected' && <XCircle className="h-3 w-3" />}
                    {kyc.result === 'pending' && <AlertCircle className="h-3 w-3" />}
                    {kyc.result}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">₹{kyc.cost.toFixed(2)}</span>
                    {kyc.isOverride && kyc.costDelta && kyc.costDelta > 0 && (
                      <span className="text-xs text-orange-600 font-medium">
                        (+₹{kyc.costDelta.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button className="flex items-center justify-center gap-1 flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105">
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-110">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verifications - Grid/Table View */}
      {viewMode === 'grid' && (
        <div className="card animate-fade-in">
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
                <tr key={kyc.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-3 px-4 text-sm text-gray-900">{kyc.id}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900">{kyc.endUserName}</div>
                    <div className="text-xs text-gray-500">{kyc.endUserId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {kyc.documentTypes.map((doc) => (
                        <span key={doc} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
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
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        kyc.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {kyc.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 animate-pulse" />
                      ) : (
                        <Clock className="h-3 w-3 animate-spin" />
                      )}
                      {kyc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {kyc.result ? (
                      <div className="flex items-center justify-center">
                        {kyc.result === 'approved' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" />
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
      )}

      {/* Initiate KYC Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Start New KYC Verification
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> Enter customer details below. They'll receive a secure email/SMS link to complete their own KYC verification.
              </p>
            </div>

            <div className="space-y-4">
              {/* End User Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  value={formData.endUserName}
                  onChange={(e) =>
                    setFormData({ ...formData, endUserName: e.target.value })
                  }
                  placeholder="John Doe"
                  className="input"
                />
              </div>

              {/* End User Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email *
                </label>
                <input
                  type="email"
                  value={formData.endUserEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, endUserEmail: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  KYC link will be sent to this email
                </p>
              </div>

              {/* End User Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.endUserPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, endUserPhone: e.target.value })
                  }
                  placeholder="+1234567890"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  SMS notification (optional)
                </p>
              </div>

              {/* Document Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Types Required *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {documentTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
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

              {/* Verification Methods */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎯 Verification Methods Required *
                </label>
                <div className="space-y-3">
                  {/* Liveness Check */}
                  <div className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id="liveness"
                      checked={formData.verificationMethods.livenessCheck}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          verificationMethods: {
                            ...formData.verificationMethods,
                            livenessCheck: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <label htmlFor="liveness" className="text-sm font-medium text-gray-900 cursor-pointer">
                        🎥 Live Face Verification
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Real-time liveness detection with smile, blink, and head turn checks
                      </p>
                    </div>
                  </div>

                  {/* DigiLocker */}
                  <div className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id="digilocker"
                      checked={formData.verificationMethods.digilocker}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          verificationMethods: {
                            ...formData.verificationMethods,
                            digilocker: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <label htmlFor="digilocker" className="text-sm font-medium text-gray-900 cursor-pointer">
                        🛡️ DigiLocker e-KYC
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Government-verified documents (Aadhaar, PAN, DL) via DigiLocker OAuth
                      </p>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id="docUpload"
                      checked={formData.verificationMethods.documentUpload}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          verificationMethods: {
                            ...formData.verificationMethods,
                            documentUpload: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <label htmlFor="docUpload" className="text-sm font-medium text-gray-900 cursor-pointer">
                        📄 Manual Document Upload
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Traditional document upload (takes 1-2 business days for verification)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC Override Section */}
              <div className="border-t pt-4">
                <label className="flex items-center mb-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isOverride}
                    onChange={(e) =>
                      setFormData({ ...formData, isOverride: e.target.checked })
                    }
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                    🔧 Apply Custom KYC Configuration (Override)
                  </span>
                </label>

                {formData.isOverride && (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4 space-y-4 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-orange-800">
                        <p className="font-semibold mb-1">⚠️ Override Mode Enabled</p>
                        <p className="text-xs">
                          You are adding extra verification modules beyond default config. This will increase cost per customer.
                        </p>
                      </div>
                    </div>

                    {/* Additional Modules */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Additional Verification Modules
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-start p-3 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={formData.additionalModules.includes('aadhaar_otp')}
                            onChange={(e) => {
                              const modules = e.target.checked
                                ? [...formData.additionalModules, 'aadhaar_otp']
                                : formData.additionalModules.filter(m => m !== 'aadhaar_otp');
                              setFormData({ ...formData, additionalModules: modules });
                            }}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded mt-0.5"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                📱 Third-Party Aadhaar OTP
                              </span>
                              <span className="text-sm font-semibold text-orange-600">+₹3.50</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Real-time Aadhaar verification via IDfy/Signzy
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start p-3 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={formData.additionalModules.includes('video_kyc')}
                            onChange={(e) => {
                              const modules = e.target.checked
                                ? [...formData.additionalModules, 'video_kyc']
                                : formData.additionalModules.filter(m => m !== 'video_kyc');
                              setFormData({ ...formData, additionalModules: modules });
                            }}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded mt-0.5"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                🎥 Video KYC (Live Agent)
                              </span>
                              <span className="text-sm font-semibold text-orange-600">+₹15.00</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Live video call verification with trained agent
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start p-3 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={formData.additionalModules.includes('enhanced_liveness')}
                            onChange={(e) => {
                              const modules = e.target.checked
                                ? [...formData.additionalModules, 'enhanced_liveness']
                                : formData.additionalModules.filter(m => m !== 'enhanced_liveness');
                              setFormData({ ...formData, additionalModules: modules });
                            }}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded mt-0.5"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                🔍 Enhanced Liveness Detection
                              </span>
                              <span className="text-sm font-semibold text-orange-600">+₹2.00</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Advanced anti-spoofing with 3D depth analysis
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Override Reason (Mandatory) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Override Reason <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        value={formData.overrideReason}
                        onChange={(e) =>
                          setFormData({ ...formData, overrideReason: e.target.value })
                        }
                        placeholder="Explain why this customer requires additional verification modules..."
                        maxLength={500}
                        rows={3}
                        required={formData.isOverride}
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.overrideReason.length}/500 characters • Required for audit trail
                      </p>
                    </div>

                    {/* Override Notes (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={formData.overrideNotes}
                        onChange={(e) =>
                          setFormData({ ...formData, overrideNotes: e.target.value })
                        }
                        placeholder="Any additional context or special instructions..."
                        rows={2}
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Cost Impact Summary */}
                    {formData.additionalModules.length > 0 && (
                      <div className="bg-white border-2 border-orange-300 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Cost Impact:</span>
                          <span className="text-lg font-bold text-orange-600">
                            +₹{formData.additionalModules.reduce((sum, module) => {
                              const costs: Record<string, number> = {
                                'aadhaar_otp': 3.50,
                                'video_kyc': 15.00,
                                'enhanced_liveness': 2.00
                              };
                              return sum + (costs[module] || 0);
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Base Cost:</span>
                            <span className="font-medium">₹1.65</span>
                          </div>
                          <div className="flex justify-between">
                            <span>With Override:</span>
                            <span className="font-semibold text-orange-600">
                              ₹{(1.65 + formData.additionalModules.reduce((sum, module) => {
                                const costs: Record<string, number> = {
                                  'aadhaar_otp': 3.50,
                                  'video_kyc': 15.00,
                                  'enhanced_liveness': 2.00
                                };
                                return sum + (costs[module] || 0);
                              }, 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Estimated Cost */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Cost:</span>
                  <span className={`text-lg font-semibold ${formData.isOverride && formData.additionalModules.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                    ₹{(1.65 + (formData.isOverride ? formData.additionalModules.reduce((sum, module) => {
                      const costs: Record<string, number> = {
                        'aadhaar_otp': 3.50,
                        'video_kyc': 15.00,
                        'enhanced_liveness': 2.00
                      };
                      return sum + (costs[module] || 0);
                    }, 0) : 0)).toFixed(2)}
                  </span>
                </div>
                {formData.isOverride && formData.additionalModules.length > 0 && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Includes override surcharge
                  </p>
                )}
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
                disabled={
                  !formData.endUserName || 
                  !formData.endUserEmail || 
                  formData.documentTypes.length === 0 ||
                  (formData.isOverride && (!formData.overrideReason || formData.overrideReason.trim().length === 0))
                }
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formData.isOverride ? '🔧 Send KYC Link (Override)' : 'Send KYC Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
