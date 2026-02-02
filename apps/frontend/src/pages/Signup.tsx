import { useState } from 'react';
import { Building2, Mail, Lock, User, Phone, Globe, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    industry: '',
    
    // Step 2: Admin User
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    
    // Step 3: Plan Selection
    plan: 'basic',
  });

  const industries = [
    'Banking & Finance',
    'Fintech',
    'Insurance',
    'Real Estate',
    'Healthcare',
    'E-commerce',
    'Telecom',
    'Government',
    'Other',
  ];

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 2.5,
      features: [
        'KYC Verification',
        'Document Verification',
        'Email Support',
        'Basic Analytics',
      ],
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 2.0,
      features: [
        'Everything in Basic',
        'Voice Verification',
        'Bulk Upload (CSV)',
        'Priority Support',
        'Advanced Analytics',
        'API Access',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1.5,
      features: [
        'Everything in Pro',
        'Custom Branding',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'SLA Guarantee',
        'Custom Integrations',
      ],
    },
  ];

  const handleSubmit = () => {
    // TODO: API call to create tenant
    console.log('Creating tenant:', formData);
    alert('🎉 Account created successfully! Check your email for verification.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-10 w-10" />
            <h1 className="text-3xl font-bold">Callvia Certo</h1>
          </div>
          <p className="text-blue-100">Create your compliance platform account</p>
          
          {/* Steps */}
          <div className="flex items-center justify-between mt-8 max-w-md">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'
                }`}>
                  {step > s ? <CheckCircle className="h-6 w-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-white' : 'bg-primary-500'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Step 1: Company Information */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="ABC Finance Ltd."
                    className="input pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      placeholder="contact@abcfinance.com"
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.companyPhone}
                      onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                      placeholder="+1234567890"
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    placeholder="https://abcfinance.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input"
                >
                  <option value="">Select industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.companyName || !formData.companyEmail || !formData.industry}
                className="btn btn-primary w-full"
              >
                Next: Admin Account
              </button>
            </div>
          )}

          {/* Step 2: Admin User */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900">Admin Account</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="John Doe"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="john@abcfinance.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    placeholder="••••••••"
                    className="input pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.adminPasswordConfirm}
                    onChange={(e) => setFormData({ ...formData, adminPasswordConfirm: e.target.value })}
                    placeholder="••••••••"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.adminName || !formData.adminEmail || !formData.adminPassword || formData.adminPassword !== formData.adminPasswordConfirm}
                  className="btn btn-primary flex-1"
                >
                  Next: Choose Plan
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
              
              <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      formData.plan === plan.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-primary-600 mb-4">
                      ${plan.price}
                      <span className="text-sm text-gray-600 font-normal">/verification</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💳 No credit card required!</strong> Start with $10 free credit. Pay only for what you use.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary flex-1"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
