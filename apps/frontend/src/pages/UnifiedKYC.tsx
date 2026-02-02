import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Loader2, ArrowRight, Camera, FileText } from 'lucide-react';

type VerificationStep = 'loading' | 'liveness' | 'digilocker' | 'documents' | 'complete';

export default function UnifiedKYC() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<VerificationStep>('loading');
  const [sessionData, setSessionData] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  const [verificationMethods, setVerificationMethods] = useState({
    livenessCheck: false,
    digilocker: false,
    documentUpload: false,
  });

  // Fetch session data on load
  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      // For now, use mock data since backend doesn't have session fetch endpoint yet
      // In production, fetch from: /api/v1/kyc/session/{sessionId}
      
      // Mock session data - replace with actual API call
      const mockSession = {
        id: sessionId,
        verificationMethods: {
          livenessCheck: true,
          digilocker: true,
          documentUpload: true,
        },
        documentTypes: ['National ID', 'Passport'],
        status: 'pending',
      };
      
      setSessionData(mockSession);
      setVerificationMethods(mockSession.verificationMethods);
      
      // Determine first step
      if (mockSession.verificationMethods.livenessCheck) {
        setCurrentStep('liveness');
      } else if (mockSession.verificationMethods.digilocker) {
        setCurrentStep('digilocker');
      } else if (mockSession.verificationMethods.documentUpload) {
        setCurrentStep('documents');
      } else {
        setCurrentStep('complete');
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStepComplete = (step: string) => {
    setCompletedSteps([...completedSteps, step]);
    
    // Move to next step
    if (step === 'liveness' && verificationMethods.digilocker) {
      setCurrentStep('digilocker');
    } else if ((step === 'liveness' || step === 'digilocker') && verificationMethods.documentUpload) {
      setCurrentStep('documents');
    } else {
      setCurrentStep('complete');
    }
  };

  const renderProgress = () => {
    const steps = [];
    if (verificationMethods.livenessCheck) steps.push({ id: 'liveness', label: 'Live Verification', icon: Camera });
    if (verificationMethods.digilocker) steps.push({ id: 'digilocker', label: 'DigiLocker', icon: Shield });
    if (verificationMethods.documentUpload) steps.push({ id: 'documents', label: 'Documents', icon: FileText });

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center ${isCompleted ? 'text-green-600' : isCurrent ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' : isCurrent ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className="ml-2 text-sm font-medium">{step.label}</span>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className={`w-5 h-5 mx-4 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Verification...</h2>
        <p className="text-gray-600">Please wait while we prepare your KYC verification</p>
      </div>
    </div>
  );

  const renderLivenessStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Camera className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Face Verification</h2>
        <p className="text-gray-600 mb-6">
          Complete real-time liveness detection with smile, blink, and head turn checks
        </p>
        <button
          onClick={() => navigate(`/kyc/live?sessionId=${sessionId}`)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Start Live Verification
        </button>
        
        {/* For demo: Skip button */}
        <button
          onClick={() => handleStepComplete('liveness')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now (Demo only)
        </button>
      </div>
    </div>
  );

  const renderDigiLockerStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">DigiLocker Verification</h2>
        <p className="text-gray-600 mb-6">
          Verify your identity using government-verified documents via DigiLocker OAuth
        </p>
        <button
          onClick={() => navigate(`/kyc/digital?sessionId=${sessionId}`)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Continue with DigiLocker
        </button>
        
        {/* For demo: Skip button */}
        <button
          onClick={() => handleStepComplete('digilocker')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now (Demo only)
        </button>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Documents</h2>
        <p className="text-gray-600 mb-6">
          Upload required documents: {sessionData?.documentTypes?.join(', ')}
        </p>
        <button
          onClick={() => navigate(`/verify/kyc/${sessionId}`)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Upload Documents
        </button>
        
        {/* For demo: Skip button */}
        <button
          onClick={() => handleStepComplete('documents')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now (Demo only)
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-4 border-green-500">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Complete!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for completing your KYC verification. Your submission is under review.
        </p>
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>Session ID:</strong> {sessionId}
          </p>
          <p className="text-sm text-green-800 mt-1">
            <strong>Completed Steps:</strong> {completedSteps.length} of {Object.values(verificationMethods).filter(Boolean).length}
          </p>
        </div>
        <button
          onClick={() => window.close()}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Close Window
        </button>
      </div>
    </div>
  );

  if (loading) return renderLoading();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Session</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
          <p className="text-gray-600">Complete all required verification steps</p>
        </div>

        {renderProgress()}

        <div className="mt-8">
          {currentStep === 'liveness' && renderLivenessStep()}
          {currentStep === 'digilocker' && renderDigiLockerStep()}
          {currentStep === 'documents' && renderDocumentsStep()}
          {currentStep === 'complete' && renderComplete()}
        </div>
      </div>
    </div>
  );
}
