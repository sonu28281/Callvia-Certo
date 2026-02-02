import { useState, useRef } from 'react';
import { 
  Shield, 
  CheckCircle, 
  Loader2, 
  Camera, 
  FileCheck, 
  Smartphone,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';

type VerificationMethod = 'digilocker' | 'aadhaar-otp' | 'manual';
type KYCStep = 'method-selection' | 'aadhaar-input' | 'otp-verification' | 'selfie-capture' | 'verification-complete';

interface AadhaarData {
  name: string;
  dob: string;
  gender: string;
  address: {
    house: string;
    street: string;
    locality: string;
    dist: string;
    state: string;
    pincode: string;
  };
  maskedAadhaar: string;
}

export default function DigitalKYC() {
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod | null>(null);
  const [currentStep, setCurrentStep] = useState<KYCStep>('method-selection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Aadhaar OTP flow state
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [sessionId, setSessionId] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_requestId, setRequestId] = useState('');
  const [otp, setOtp] = useState('');
  const [kycData, setKycData] = useState<AadhaarData | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [faceMatchResult, setFaceMatchResult] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Verification methods configuration
  const methods = [
    {
      id: 'digilocker' as VerificationMethod,
      name: 'DigiLocker',
      icon: Shield,
      description: 'Instant verification using government-verified documents',
      recommended: true,
      features: [
        'Government-verified documents',
        'No manual upload needed',
        'Instant verification',
        'Most secure method'
      ],
      badge: 'Recommended',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      id: 'aadhaar-otp' as VerificationMethod,
      name: 'Aadhaar OTP',
      icon: Smartphone,
      description: 'Verify using Aadhaar number and OTP',
      recommended: false,
      features: [
        'OTP to registered mobile',
        'Direct UIDAI verification',
        'Quick process',
        'Face matching included'
      ],
      badge: 'Fast',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      id: 'manual' as VerificationMethod,
      name: 'Manual Upload',
      icon: FileCheck,
      description: 'Upload documents manually (slower verification)',
      recommended: false,
      features: [
        'Upload documents manually',
        'Takes 1-2 business days',
        'Manual review required',
        'For users without DigiLocker'
      ],
      badge: 'Legacy',
      color: 'bg-gray-50 border-gray-200',
      iconColor: 'text-gray-600',
    },
  ];

  // Handle Live KYC
  const handleLiveKYC = () => {
    window.location.href = '/kyc/live';
  };

  // Handle DigiLocker flow
  const handleDigiLockerVerification = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/kyc/digital/digilocker/init');
      const data = await response.json();
      
      if (data.success) {
        // Check if mock mode
        if (data.authUrl.includes('/mock')) {
          // Mock mode - call mock endpoint directly
          const mockResponse = await fetch(data.authUrl);
          const mockData = await mockResponse.json();
          
          if (mockData.success) {
            alert('🎭 DEMO MODE\n\nDigiLocker verification successful!\n\nReal DigiLocker requires API registration at:\nhttps://partners.digilocker.gov.in/');
            setKycData(mockData.kycData.documents.aadhaar);
            setCurrentStep('verification-complete');
          } else {
            throw new Error(mockData.error);
          }
        } else {
          // Real mode - redirect to DigiLocker OAuth
          window.location.href = data.authUrl;
        }
      } else {
        throw new Error(data.error || 'Failed to initialize DigiLocker');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Format Aadhaar number with spaces
  const formatAadhaarNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Handle Aadhaar OTP - Step 1: Send OTP
  const handleAadhaarOTPInit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanedAadhaar = aadhaarNumber.replace(/\s/g, '');
      
      // Validate Aadhaar format (12 digits)
      if (!/^\d{12}$/.test(cleanedAadhaar)) {
        throw new Error('Please enter a valid 12-digit Aadhaar number');
      }
      
      // Demo mode: Show OTP directly
      alert('🎭 DEMO MODE\n\nReal Aadhaar OTP requires paid API (IDfy/Signzy).\n\nFor testing, use OTP: 123456');
      
      const response = await fetch('/api/v1/kyc/digital/aadhaar/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaarNumber: cleanedAadhaar }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setRequestId(data.requestId);
        setCurrentStep('otp-verification');
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Aadhaar OTP - Step 2: Verify OTP
  const handleAadhaarOTPVerify = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }
      
      const response = await fetch('/api/v1/kyc/digital/aadhaar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          otp,
          selfiePhoto // Include if captured
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.verified) {
        setKycData(data.data);
        setFaceMatchResult(data.faceMatch);
        setCurrentStep('verification-complete');
      } else {
        throw new Error(data.error || 'OTP verification failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start camera for selfie
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please allow camera permission.');
    }
  };

  // Capture selfie
  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg');
        setSelfiePhoto(photoData);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
    }
  };

  // Render method selection
  const renderMethodSelection = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital KYC Verification</h1>
        <p className="text-gray-600">Choose your preferred verification method</p>
      </div>

      {/* Live KYC Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all" onClick={handleLiveKYC}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="w-12 h-12 mr-4" />
            <div>
              <h3 className="text-2xl font-bold mb-1">🔴 Live Face Verification</h3>
              <p className="text-purple-100">Advanced liveness detection with camera - Most secure!</p>
            </div>
          </div>
          <ArrowRight className="w-8 h-8" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <div
              key={method.id}
              className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl ${
                method.color
              } ${selectedMethod === method.id ? 'ring-4 ring-primary-500 ring-opacity-50' : ''}`}
              onClick={() => {
                setSelectedMethod(method.id);
                setError(null);
              }}
            >
              {method.recommended && (
                <span className="absolute -top-3 left-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {method.badge}
                </span>
              )}
              
              <div className={`inline-flex p-3 ${method.iconColor} bg-white rounded-xl mb-4`}>
                <Icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{method.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{method.description}</p>
              
              <ul className="space-y-2 mb-6">
                {method.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {selectedMethod === method.id && (
                <div className="absolute bottom-6 right-6">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            if (selectedMethod === 'digilocker') {
              handleDigiLockerVerification();
            } else if (selectedMethod === 'aadhaar-otp') {
              setCurrentStep('aadhaar-input');
            } else {
              window.location.href = '/kyc'; // Redirect to manual upload
            }
          }}
          disabled={!selectedMethod || loading}
          className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue with {selectedMethod && methods.find(m => m.id === selectedMethod)?.name}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render Aadhaar input
  const renderAadhaarInput = () => (
    <div className="max-w-md mx-auto p-6">
      <button
        onClick={() => setCurrentStep('method-selection')}
        className="text-primary-600 hover:text-primary-700 mb-6 flex items-center"
      >
        ← Back to methods
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Aadhaar Number</h2>
          <p className="text-gray-600 text-sm">OTP will be sent to your registered mobile</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhaar Number
            </label>
            <input
              type="text"
              value={aadhaarNumber}
              onChange={(e) => {
                const formatted = formatAadhaarNumber(e.target.value);
                if (formatted.replace(/\s/g, '').length <= 12) {
                  setAadhaarNumber(formatted);
                }
              }}
              placeholder="1234 5678 9012"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-center text-lg tracking-wider"
              maxLength={14}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your Aadhaar number is encrypted and never stored
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleAadhaarOTPInit}
            disabled={aadhaarNumber.replace(/\s/g, '').length !== 12 || loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Send OTP
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render OTP verification
  const renderOTPVerification = () => (
    <div className="max-w-md mx-auto p-6">
      <button
        onClick={() => setCurrentStep('aadhaar-input')}
        className="text-primary-600 hover:text-primary-700 mb-6 flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
          <p className="text-gray-600 text-sm">
            OTP sent to Aadhaar-registered mobile<br />
            <span className="font-mono text-gray-900">{aadhaarNumber}</span>
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              6-Digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) setOtp(value);
              }}
              placeholder="000000"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />
          </div>

          {/* Optional: Selfie capture */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
              Capture Selfie (Optional but Recommended)
            </h3>
            
            {!cameraActive && !selfiePhoto && (
              <button
                onClick={startCamera}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-700"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Camera
              </button>
            )}

            {cameraActive && (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <button
                  onClick={captureSelfie}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Capture Photo
                </button>
              </div>
            )}

            {selfiePhoto && (
              <div className="space-y-3">
                <img src={selfiePhoto} alt="Selfie" className="w-full rounded-lg" />
                <button
                  onClick={() => {
                    setSelfiePhoto(null);
                    startCamera();
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  Retake Photo
                </button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleAadhaarOTPVerify}
            disabled={otp.length !== 6 || loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify OTP
                <CheckCircle className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          <button
            onClick={handleAadhaarOTPInit}
            className="w-full text-sm text-blue-600 hover:text-blue-700"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );

  // Render verification complete
  const renderVerificationComplete = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">KYC Verified Successfully!</h2>
          <p className="text-gray-600">Your identity has been verified</p>
        </div>

        {kycData && (
          <div className="space-y-4 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Verified Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{kycData.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">{kycData.dob}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Aadhaar</p>
                  <p className="font-medium text-gray-900 font-mono">{kycData.maskedAadhaar}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900">{kycData.gender === 'M' ? 'Male' : kycData.gender === 'F' ? 'Female' : 'Other'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4 border-t">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm text-gray-900">
                  {kycData.address.house && `${kycData.address.house}, `}
                  {kycData.address.street && `${kycData.address.street}, `}
                  {kycData.address.locality && `${kycData.address.locality}, `}
                  {kycData.address.dist && `${kycData.address.dist}, `}
                  {kycData.address.state && `${kycData.address.state} - `}
                  {kycData.address.pincode}
                </p>
              </div>
            </div>

            {faceMatchResult && (
              <div className="pt-4 border-t">
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  faceMatchResult.matched ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <span className="text-sm font-medium">Face Match</span>
                  <div className="flex items-center">
                    {faceMatchResult.matched ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    )}
                    <span className="text-sm font-semibold">
                      {faceMatchResult.confidence}% Match
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {currentStep === 'method-selection' && renderMethodSelection()}
      {currentStep === 'aadhaar-input' && renderAadhaarInput()}
      {currentStep === 'otp-verification' && renderOTPVerification()}
      {currentStep === 'verification-complete' && renderVerificationComplete()}
    </div>
  );
}
