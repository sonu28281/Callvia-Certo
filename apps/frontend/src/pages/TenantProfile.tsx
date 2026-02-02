import { useState, useEffect } from 'react';

interface KYCMethod {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
}

interface TenantProfile {
  tenantId: string;
  companyName: string;
  kycConfig: {
    methods: string[];
    allowOverrides: boolean;
    methodNames: string[];
  };
  pricing: {
    totalPrice: number;
    breakdown: Record<string, number>;
  };
  emailConfig: {
    templateType: string;
    brandColor?: string;
    customMessage?: string;
  };
  marketSegment: string;
}

interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  methods: string[];
  methodNames: string[];
  price: number;
  breakdown: Record<string, number>;
}

const AVAILABLE_METHODS: KYCMethod[] = [
  {
    id: 'digilocker',
    name: 'DigiLocker Verification',
    cost: 1.00,
    description: 'Government-issued document verification via DigiLocker',
    icon: '📄'
  },
  {
    id: 'liveness',
    name: 'Live Face Detection',
    cost: 1.50,
    description: 'Real-time liveness check with face detection',
    icon: '👤'
  },
  {
    id: 'aadhaar_otp',
    name: 'Aadhaar OTP (Third-party)',
    cost: 3.50,
    description: 'Aadhaar verification via OTP (requires external service)',
    icon: '📱'
  },
  {
    id: 'passport',
    name: 'Passport Verification',
    cost: 2.00,
    description: 'International passport document verification',
    icon: '🛂'
  },
  {
    id: 'document_upload',
    name: 'Document Upload & OCR',
    cost: 1.00,
    description: 'Manual document upload with OCR processing',
    icon: '📎'
  },
  {
    id: 'video_kyc',
    name: 'Video KYC (Live Agent)',
    cost: 15.00,
    description: 'Real-time video verification with live agent',
    icon: '🎥'
  },
  {
    id: 'digital_contract',
    name: 'Digital Contract Signing',
    cost: 2.00,
    description: 'E-signature for contracts and agreements',
    icon: '✍️'
  }
];

export default function TenantProfilePage() {
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [allowOverrides, setAllowOverrides] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'methods' | 'templates' | 'email'>('methods');

  useEffect(() => {
    fetchProfile();
    fetchTemplates();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/reseller/profile');
      console.log('Profile API response status:', response.status);
      
      const text = await response.text();
      console.log('Profile API response text:', text);
      
      // Try to parse JSON
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
      }
      
      // Check if we got valid data
      if (data && data.success && data.data) {
        console.log('Profile data loaded from API:', data.data);
        setProfile(data.data);
        setSelectedMethods(data.data.kycConfig.methods);
        setAllowOverrides(data.data.kycConfig.allowOverrides);
        setCustomMessage(data.data.emailConfig.customMessage || '');
      } else {
        // Use mock profile for testing
        console.warn('API failed or returned invalid data, using mock profile');
        const mockProfile = {
          tenantId: 'tenant_test_001',
          companyName: 'Test Company',
          kycConfig: {
            methods: ['digilocker', 'liveness'],
            allowOverrides: false,
            methodNames: ['DigiLocker Verification', 'Live Face Detection']
          },
          pricing: {
            totalPrice: 2.50,
            breakdown: { digilocker: 1.00, liveness: 1.50 }
          },
          emailConfig: {
            templateType: 'standard',
            brandColor: '#3B82F6',
            customMessage: ''
          },
          marketSegment: 'standard'
        };
        setProfile(mockProfile);
        setSelectedMethods(mockProfile.kycConfig.methods);
        setAllowOverrides(mockProfile.kycConfig.allowOverrides);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use mock profile on error
      const mockProfile = {
        tenantId: 'tenant_test_001',
        companyName: 'Test Company',
        kycConfig: {
          methods: ['digilocker', 'liveness'],
          allowOverrides: false,
          methodNames: ['DigiLocker Verification', 'Live Face Detection']
        },
        pricing: {
          totalPrice: 2.50,
          breakdown: { digilocker: 1.00, liveness: 1.50 }
        },
        emailConfig: {
          templateType: 'standard',
          brandColor: '#3B82F6',
          customMessage: ''
        },
        marketSegment: 'standard'
      };
      setProfile(mockProfile);
      setSelectedMethods(mockProfile.kycConfig.methods);
      setAllowOverrides(mockProfile.kycConfig.allowOverrides);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/reseller/profile/pricing-templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => {
      if (prev.includes(methodId)) {
        return prev.filter(m => m !== methodId);
      } else {
        return [...prev, methodId];
      }
    });
  };

  const calculateTotalCost = () => {
    return selectedMethods.reduce((total, methodId) => {
      const method = AVAILABLE_METHODS.find(m => m.id === methodId);
      return total + (method?.cost || 0);
    }, 0);
  };

  const handleSaveConfiguration = async () => {
    if (selectedMethods.length === 0) {
      alert('Please select at least one KYC method');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/reseller/profile/kyc-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          methods: selectedMethods,
          allowOverrides
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Configuration saved successfully!');
        await fetchProfile();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error: any) {
      alert('❌ Error saving configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!confirm('This will replace your current KYC configuration. Continue?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/reseller/profile/apply-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Template applied successfully!');
        await fetchProfile();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error: any) {
      alert('❌ Error applying template: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/reseller/profile/email-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customMessage })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Email configuration saved!');
        await fetchProfile();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error: any) {
      alert('❌ Error saving email config: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Profile Not Found</h2>
          <p className="mt-2 text-gray-600">Unable to load tenant profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏢 Tenant Profile</h1>
              <p className="mt-1 text-sm text-gray-500">{profile.companyName}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Package</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{profile.pricing.totalPrice.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">per verification</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('methods')}
              className={`${
                activeTab === 'methods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              KYC Methods
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Email Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Methods Tab */}
        {activeTab === 'methods' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Verification Methods</h2>
            <p className="text-sm text-gray-600 mb-6">
              Choose the KYC methods that will be available to all your customers by default.
            </p>

            <div className="space-y-4 mb-6">
              {AVAILABLE_METHODS.map(method => (
                <label
                  key={method.id}
                  className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  style={{
                    borderColor: selectedMethods.includes(method.id) ? '#3B82F6' : '#E5E7EB'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes(method.id)}
                    onChange={() => handleMethodToggle(method.id)}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{method.icon}</span>
                        <span className="text-lg font-medium text-gray-900">{method.name}</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">₹{method.cost.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowOverrides}
                  onChange={(e) => setAllowOverrides(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Allow per-customer overrides (admins can customize KYC for specific customers)
                </span>
              </label>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-700">Total Cost per Verification</div>
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{calculateTotalCost().toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedMethods.length} method{selectedMethods.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
                <button
                  onClick={handleSaveConfiguration}
                  disabled={saving || selectedMethods.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pre-configured Packages</h2>
            <p className="text-sm text-gray-600 mb-6">
              Choose a pre-configured package to quickly set up your KYC methods.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {template.methodNames.map((name, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <span className="text-green-600 mr-2">✓</span>
                        {name}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{template.price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleApplyTemplate(template.id)}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
                    >
                      {saving ? 'Applying...' : 'Apply Template'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Email Template Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Customize the email that your customers receive when KYC is initiated.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a custom message for your customers..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  This message will appear at the top of the KYC email sent to customers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  Current: <span className="font-medium">{profile.emailConfig.templateType}</span>
                  <p className="text-xs mt-1">
                    Template type is automatically selected based on your configured KYC methods.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveEmailConfig}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
                >
                  {saving ? 'Saving...' : 'Save Email Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
