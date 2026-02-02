import { VerificationData } from '../VerificationWizard';

interface CustomerDetailsStepProps {
  data: VerificationData;
  onUpdate: (updates: Partial<VerificationData>) => void;
  onNext: () => void;
}

export default function CustomerDetailsStep({ data, onUpdate, onNext }: CustomerDetailsStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.customerName && data.customerPhone && data.consent) {
      onNext();
    }
  };

  const isValid = data.customerName && data.customerPhone && data.consent;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        <p className="text-sm text-gray-600 mb-6">Enter the customer details you want to verify</p>
      </div>

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Name *
        </label>
        <input
          type="text"
          value={data.customerName}
          onChange={(e) => onUpdate({ customerName: e.target.value })}
          placeholder="e.g., John Doe"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          required
        />
      </div>

      {/* Customer Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number (10 digits) *
        </label>
        <input
          type="tel"
          value={data.customerPhone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
            onUpdate({ customerPhone: value });
          }}
          placeholder="e.g., 9876543210"
          maxLength={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Format: 10 digits, no spaces or dashes</p>
      </div>

      {/* Customer Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address (Optional)
        </label>
        <input
          type="email"
          value={data.customerEmail}
          onChange={(e) => onUpdate({ customerEmail: e.target.value })}
          placeholder="e.g., john@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Verification Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Verification Services
        </label>
        <div className="space-y-2">
          {[
            { id: 'aadhaar', label: 'Aadhaar OTP + PAN + Bank (Most Common)' },
            { id: 'pan-only', label: 'PAN Only' },
            { id: 'aadhaar-only', label: 'Aadhaar Only' },
            { id: 'bank-only', label: 'Bank Account Only' },
          ].map((option) => (
            <label key={option.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="verification-type"
                value={option.id}
                checked={
                  (option.id === 'aadhaar' && data.verificationTypes.includes('aadhaar')) ||
                  (option.id === 'pan-only' && data.verificationTypes.includes('pan') && !data.verificationTypes.includes('aadhaar')) ||
                  (option.id === 'aadhaar-only' && data.verificationTypes.includes('aadhaar') && !data.verificationTypes.includes('pan')) ||
                  (option.id === 'bank-only' && data.verificationTypes.includes('bank') && !data.verificationTypes.includes('aadhaar'))
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    if (option.id === 'aadhaar') {
                      onUpdate({ verificationTypes: ['aadhaar', 'pan', 'bank'] });
                    } else if (option.id === 'pan-only') {
                      onUpdate({ verificationTypes: ['pan'] });
                    } else if (option.id === 'aadhaar-only') {
                      onUpdate({ verificationTypes: ['aadhaar'] });
                    } else if (option.id === 'bank-only') {
                      onUpdate({ verificationTypes: ['bank'] });
                    }
                  }
                }}
                className="w-4 h-4 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={(e) => onUpdate({ consent: e.target.checked })}
            className="w-4 h-4 text-blue-500 focus:ring-blue-500 mt-1 cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            <strong>I have obtained customer consent</strong> for KYC verification and data processing as per regulations.
          </span>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={!isValid}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            isValid
              ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </form>
  );
}
