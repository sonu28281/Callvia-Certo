import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, FileText, Camera } from 'lucide-react';

export default function VerifyKYC() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const documentTypes = [
    { id: 'passport', label: 'Passport', icon: FileText },
    { id: 'driving_license', label: 'Driving License', icon: FileText },
    { id: 'selfie', label: 'Selfie Photo', icon: Camera },
  ];

  const handleFileSelect = (docType: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [docType]: file }));
  };

  const handleSubmit = async () => {
    setUploading(true);
    setError('');

    try {
      // Upload each document
      for (const [docType, file] of Object.entries(uploadedFiles)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `/api/v1/kyc/inhouse/${sessionId}/upload?documentType=${docType}`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to upload ${docType}`);
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Documents Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for submitting your documents. We'll review them and notify you of the results soon.
          </p>
          <p className="text-sm text-gray-500">
            Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
              <p className="text-gray-600">Upload your identity documents</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Session ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{sessionId}</code>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Sections */}
        <div className="space-y-6">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            const file = uploadedFiles[docType.id];

            return (
              <div key={docType.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900">{docType.label}</h3>
                  {file && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    id={`file-${docType.id}`}
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) handleFileSelect(docType.id, selectedFile);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor={`file-${docType.id}`}
                    className="cursor-pointer block"
                  >
                    {file ? (
                      <div className="space-y-2">
                        <FileText className="w-12 h-12 text-green-600 mx-auto" />
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          type="button"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Change File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-base font-medium text-gray-900">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, PDF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(uploadedFiles).length === 0 || uploading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              Object.keys(uploadedFiles).length === 0 || uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading Documents...
              </span>
            ) : (
              `Submit ${Object.keys(uploadedFiles).length} Document${Object.keys(uploadedFiles).length !== 1 ? 's' : ''}`
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            By submitting, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
