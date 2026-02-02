import { useState } from 'react';
import { X } from 'lucide-react';
import CustomerDetailsStep from './steps/CustomerDetailsStep';
import AadhaarStep from './steps/AadhaarStep';
import PanStep from './steps/PanStep';
import BankStep from './steps/BankStep';
import ResultsStep from './steps/ResultsStep';

interface VerificationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export type VerificationStep = 'customer-details' | 'aadhaar' | 'pan' | 'bank' | 'results';

export interface VerificationData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  verificationTypes: string[];
  consent: boolean;
  aadhaar?: {
    number: string;
    otp: string;
    verified: boolean;
    data?: Record<string, any>;
  };
  pan?: {
    number: string;
    verified: boolean;
    data?: Record<string, any>;
  };
  bank?: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
    verified: boolean;
    data?: Record<string, any>;
  };
  overallStatus?: 'pass' | 'review' | 'fail';
  verificationId?: string;
}

export default function VerificationWizard({ onClose, onSuccess }: VerificationWizardProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('customer-details');
  const [data, setData] = useState<VerificationData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    verificationTypes: ['aadhaar', 'pan', 'bank'],
    consent: false,
  });

  const stepsOrder: VerificationStep[] = ['customer-details', 'aadhaar', 'pan', 'bank', 'results'];
  const currentStepIndex = stepsOrder.indexOf(currentStep);

  const goToNextStep = () => {
    if (currentStepIndex < stepsOrder.length - 1) {
      setCurrentStep(stepsOrder[currentStepIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(stepsOrder[currentStepIndex - 1]);
    }
  };

  const updateData = (updates: Partial<VerificationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Verification</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStepIndex + 1} of {stepsOrder.length}: {currentStep.replace('-', ' ').toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {stepsOrder.map((step, index) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {currentStep === 'customer-details' && (
            <CustomerDetailsStep
              data={data}
              onUpdate={updateData}
              onNext={goToNextStep}
            />
          )}
          {currentStep === 'aadhaar' && (
            <AadhaarStep
              data={data}
              onUpdate={updateData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}
          {currentStep === 'pan' && (
            <PanStep
              data={data}
              onUpdate={updateData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}
          {currentStep === 'bank' && (
            <BankStep
              data={data}
              onUpdate={updateData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}
          {currentStep === 'results' && (
            <ResultsStep
              data={data}
              onClose={() => {
                onSuccess();
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
