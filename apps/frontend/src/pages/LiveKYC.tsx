import { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Shield,
  AlertCircle,
  RotateCw,
  Smile,
  Eye,
  User
} from 'lucide-react';

type LivenessStep = 'instructions' | 'camera' | 'capturing' | 'processing' | 'result';
type LivenessAction = 'smile' | 'blink' | 'turn-left' | 'turn-right' | 'nod';

interface LivenessCheck {
  action: LivenessAction;
  label: string;
  instruction: string;
  icon: any;
  completed: boolean;
}

export default function LiveKYC() {
  const [currentStep, setCurrentStep] = useState<LivenessStep>('instructions');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedFrames = useRef<string[]>([]);

  // Liveness actions to perform
  const [livenessChecks, setLivenessChecks] = useState<LivenessCheck[]>([
    {
      action: 'smile',
      label: 'Smile',
      instruction: 'Please smile at the camera',
      icon: Smile,
      completed: false,
    },
    {
      action: 'blink',
      label: 'Blink',
      instruction: 'Blink your eyes twice',
      icon: Eye,
      completed: false,
    },
    {
      action: 'turn-left',
      label: 'Turn Left',
      instruction: 'Turn your head to the left',
      icon: RotateCw,
      completed: false,
    },
    {
      action: 'turn-right',
      label: 'Turn Right',
      instruction: 'Turn your head to the right',
      icon: RotateCw,
      completed: false,
    },
  ]);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      setCurrentStep('camera'); // Set step FIRST so video element renders
      
      // Wait for video element to be in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🎥 Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('✅ Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log('📹 Video element updated');
        
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          console.log('📺 Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('▶️ Video playing successfully!');
                setCameraActive(true);
              })
              .catch(e => {
                console.error('❌ Video play failed:', e);
                setError('Failed to play video. Please refresh and try again.');
              });
          }
        };
      } else {
        console.error('❌ Video ref is null');
        setError('Video element not found. Please refresh the page.');
      }
    } catch (err: any) {
      console.error('❌ Camera error:', err);
      setError(`Failed to access camera: ${err.message}. Please allow camera permissions.`);
      setCurrentStep('instructions'); // Go back to instructions on error
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  // Capture frame
  const captureFrame = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  };

  // Start liveness detection
  const startLivenessDetection = () => {
    setCurrentStep('capturing');
    setCurrentActionIndex(0);
    capturedFrames.current = [];
  };

  // Handle action completion
  const handleActionComplete = () => {
    // Capture frame for this action
    const frame = captureFrame();
    if (frame) {
      capturedFrames.current.push(frame);
    }

    // Mark action as completed
    const updated = [...livenessChecks];
    updated[currentActionIndex].completed = true;
    setLivenessChecks(updated);

    // Move to next action or finish
    if (currentActionIndex < livenessChecks.length - 1) {
      setCurrentActionIndex(currentActionIndex + 1);
    } else {
      finalizeLivenessCheck();
    }
  };

  // Finalize and process
  const finalizeLivenessCheck = async () => {
    setCurrentStep('processing');
    setLoading(true);

    try {
      console.log('📤 Sending frames to backend:', {
        frameCount: capturedFrames.current.length,
        actions: livenessChecks.map(c => c.action),
      });

      // Send captured frames to backend for liveness verification
      const response = await fetch('/api/v1/kyc/liveness/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: capturedFrames.current,
          actions: livenessChecks.map(c => c.action),
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);

      if (data.success) {
        setVerificationResult(data.result);
        setCurrentStep('result');
      } else {
        throw new Error(data.error || 'Liveness verification failed');
      }
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      setError(err.message);
      setCurrentStep('result');
      setVerificationResult({ isLive: false, confidence: 0 });
    } finally {
      setLoading(false);
      stopCamera();
    }
  };

  // Auto-capture after 3 seconds
  useEffect(() => {
    if (currentStep === 'capturing') {
      const timer = setTimeout(() => {
        handleActionComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentActionIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Render instructions
  const renderInstructions = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-4">
          <Camera className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Face Verification</h1>
        <p className="text-gray-600">Verify your identity using advanced liveness detection</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-6 h-6 text-primary-500 mr-2" />
          How it works
        </h2>
        <div className="space-y-4">
          {livenessChecks.map((check, index) => {
            const Icon = check.icon;
            return (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{check.label}</p>
                  <p className="text-sm text-gray-600">{check.instruction}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure good lighting on your face</li>
              <li>Remove sunglasses and masks</li>
              <li>Look directly at the camera</li>
              <li>Follow instructions carefully</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={startCamera}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
      >
        <Camera className="w-5 h-5 mr-2" />
        Start Verification
      </button>
    </div>
  );

  // Render camera view
  const renderCamera = () => {
    const currentCheck = livenessChecks[currentActionIndex];
    const ActionIcon = currentCheck?.icon || User;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="bg-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentActionIndex + 1} of {livenessChecks.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentActionIndex) / livenessChecks.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentActionIndex) / livenessChecks.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Video feed */}
          <div className="relative bg-black min-h-[400px] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                transform: 'scaleX(-1)',
                minHeight: '400px',
                width: '100%',
                objectFit: 'cover'
              }}
              className="max-h-[600px]"
            />
            
            {/* Face Oval Guide */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg width="300" height="400" className="opacity-80">
                  {/* Oval outline */}
                  <ellipse
                    cx="150"
                    cy="200"
                    rx="120"
                    ry="160"
                    fill="none"
                    stroke={currentStep === 'capturing' ? '#10b981' : '#60a5fa'}
                    strokeWidth="3"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                  />
                  
                  {/* Guide dots around oval */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
                    const radian = (angle * Math.PI) / 180;
                    const x = 150 + 120 * Math.cos(radian);
                    const y = 200 + 160 * Math.sin(radian);
                    const isActive = currentStep === 'capturing';
                    
                    return (
                      <circle
                        key={angle}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={isActive ? '#10b981' : '#60a5fa'}
                        className={isActive ? 'animate-pulse' : ''}
                      />
                    );
                  })}
                </svg>
                
                {/* Position instruction */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-2 rounded-full text-sm font-medium">
                  {currentStep === 'camera' ? '📍 Position your face in the oval' : '✅ Perfect! Hold steady'}
                </div>
              </div>
            )}
            
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Camera starting...</p>
                </div>
              </div>
            )}
            
            {/* Overlay instructions */}
            {currentStep === 'capturing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
                  <ActionIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentCheck.label}
                  </h3>
                  <p className="text-gray-600 mb-4">{currentCheck.instruction}</p>
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions completed */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-wrap gap-3 justify-center">
              {livenessChecks.map((check, index) => {
                const Icon = check.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                      check.completed
                        ? 'bg-green-100 text-green-800'
                        : index === currentActionIndex
                        ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-500'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{check.label}</span>
                    {check.completed && <CheckCircle className="w-4 h-4" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start button */}
          {currentStep === 'camera' && (
            <div className="p-6">
              <button
                onClick={startLivenessDetection}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Start Liveness Check
              </button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  };

  // Render processing
  const renderProcessing = () => (
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="bg-white rounded-2xl shadow-lg p-12">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
        <p className="text-gray-600">
          Analyzing liveness detection results
        </p>
      </div>
    </div>
  );

  // Render result
  const renderResult = () => {
    const isSuccess = verificationResult?.isLive && verificationResult?.confidence > 0.8;

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className={`bg-white rounded-2xl shadow-lg p-8 text-center ${
          isSuccess ? 'border-4 border-green-500' : 'border-4 border-red-500'
        }`}>
          {isSuccess ? (
            <>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Successful!</h2>
              <p className="text-gray-600 mb-6">
                Liveness check passed with {Math.round(verificationResult.confidence * 100)}% confidence
              </p>

              {verificationResult.kycData && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4">Verified Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{verificationResult.kycData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aadhaar:</span>
                      <span className="font-medium">{verificationResult.kycData.maskedAadhaar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DOB:</span>
                      <span className="font-medium">{verificationResult.kycData.dob}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Continue to Dashboard
              </button>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">
                {error || 'Liveness check did not pass. Please try again.'}
              </p>

              <button
                onClick={() => {
                  setCurrentStep('instructions');
                  setCurrentActionIndex(0);
                  setError(null);
                  setLivenessChecks(livenessChecks.map(c => ({ ...c, completed: false })));
                }}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8">
        {currentStep === 'instructions' && renderInstructions()}
        {(currentStep === 'camera' || currentStep === 'capturing') && renderCamera()}
        {currentStep === 'processing' && renderProcessing()}
        {currentStep === 'result' && renderResult()}
      </div>
    </div>
  );
}
